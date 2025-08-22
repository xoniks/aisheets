// Conditional import to handle native module failures gracefully
let DBSQLClient: any = null;
let DBSQLSession: any = null;
let databricksModuleAvailable = false;

// Skip Databricks initialization during build/SSG to prevent native module issues
const isBuilding = process.env.NODE_ENV === 'production' && process.env.QWIK_BUILD === '1';

if (!isBuilding) {
  try {
    const databricksModule = require('@databricks/sql');
    DBSQLClient = databricksModule.DBSQLClient;
    DBSQLSession = databricksModule.DBSQLSession;
    databricksModuleAvailable = true;
    console.log('Databricks SQL module loaded successfully');
  } catch (error: any) {
    console.warn('Databricks SQL module not available (likely due to native dependencies):', error?.message);
    databricksModuleAvailable = false;
  }
} else {
  console.log('Skipping Databricks module loading during build/SSG');
  databricksModuleAvailable = false;
}

export interface DatabricksConnection {
  id: string;
  host: string;
  httpPath: string;
  token: string;
  defaultCatalog?: string;
  defaultSchema?: string;
}

export interface QueryResult {
  columns: Array<{ name: string; type: string }>;
  rows: any[][];
  totalRows: number;
}

export interface TableInfo {
  name: string;
  catalog: string;
  schema: string;
  columns: Array<{ name: string; type: string; nullable: boolean }>;
  rowCount?: number;
}

export class DatabricksClient {
  private client: any;
  private session: any; // Use any to avoid strict typing issues for now
  
  static isAvailable(): boolean {
    return databricksModuleAvailable;
  }
  
  constructor(private connection: DatabricksConnection) {
    if (!databricksModuleAvailable || !DBSQLClient) {
      throw new Error('Databricks SQL client is not available. This may be due to missing native dependencies (LZ4).');
    }
    this.client = new DBSQLClient();
  }
  
  async connect(): Promise<void> {
    try {
      // Connect and get session
      this.session = await this.client.connect({
        host: this.connection.host,
        path: this.connection.httpPath,
        token: this.connection.token,
      });
    } catch (error: any) {
      throw new Error(`Failed to connect to Databricks: ${error?.message || error}`);
    }
  }
  
  async disconnect(): Promise<void> {
    if (this.session && typeof this.session.close === 'function') {
      await this.session.close();
      this.session = undefined;
    }
  }
  
  async testConnection(): Promise<{ success: boolean; version?: string; error?: string }> {
    try {
      await this.connect();
      
      const result = await this.executeQuery('SELECT current_version() as version', { limit: 1 });
      const version = result.rows[0]?.[0] as string;
      
      await this.disconnect();
      
      return { success: true, version };
    } catch (error: any) {
      return { success: false, error: error?.message || error };
    }
  }
  
  async listCatalogs(): Promise<Array<{ name: string }>> {
    await this.ensureConnected();
    
    const result = await this.executeQuery('SHOW CATALOGS');
    return result.rows.map(row => ({
      name: row[0] as string
    }));
  }
  
  async listSchemas(catalog?: string): Promise<string[]> {
    await this.ensureConnected();
    
    // If no catalog specified, use default or get from current context
    let sql = catalog 
      ? `SHOW SCHEMAS IN \`${catalog}\``
      : 'SHOW SCHEMAS';
    
    const result = await this.executeQuery(sql);
    return result.rows.map(row => row[0] as string);
  }
  
  async listTables(schemaOrFull?: string): Promise<string[]> {
    await this.ensureConnected();
    
    // Handle both full schema path (schema.table) or just schema name
    let sql = schemaOrFull 
      ? `SHOW TABLES IN \`${schemaOrFull}\``
      : 'SHOW TABLES';
    
    const result = await this.executeQuery(sql);
    // SHOW TABLES returns: [database, tableName, isTemporary, tableType]
    return result.rows.map(row => row[1] as string); // tableName is second column
  }
  
  async describeTable(catalog: string, schema: string, table: string): Promise<TableInfo> {
    await this.ensureConnected();
    
    // Get column information
    const describeResult = await this.executeQuery(`DESCRIBE TABLE \`${catalog}\`.\`${schema}\`.\`${table}\``);
    
    const columns = describeResult.rows.map(row => ({
      name: row[0] as string,
      type: row[1] as string,
      nullable: row[2] !== 'NO'
    }));
    
    // Try to get row count (optional, might be expensive)
    let rowCount: number | undefined;
    try {
      const countResult = await this.executeQuery(
        `SELECT COUNT(*) FROM \`${catalog}\`.\`${schema}\`.\`${table}\``,
        { limit: 1, timeout: 10000 }
      );
      rowCount = parseInt(countResult.rows[0][0] as string);
    } catch {
      // Row count failed, continue without it
    }
    
    return {
      name: table,
      catalog,
      schema,
      columns,
      rowCount
    };
  }
  
  async executeQuery(sql: string, options: { limit?: number; timeout?: number } = {}): Promise<QueryResult> {
    await this.ensureConnected();
    
    try {
      const statement = await this.session.executeStatement(sql, {
        runAsync: true,
        maxRows: options.limit || 10000,
      });
      
      const result = await statement.fetchAll();
      await statement.close();
      
      // Handle different possible result structures - be very flexible
      let columns: Array<{ name: string; type: string }> = [];
      let rows: any[][] = [];
      
      if (result && typeof result === 'object') {
        const resultAny = result as any;
        
        // Try different ways to extract schema
        if (resultAny.schema?.columns) {
          columns = resultAny.schema.columns.map((col: any) => ({
            name: col.columnName || col.name || 'column',
            type: col.typeDesc?.types?.[0]?.primitiveEntry?.type || col.type || 'STRING'
          }));
        }
        
        // Try different ways to extract rows
        if (resultAny.resultSet && Array.isArray(resultAny.resultSet)) {
          rows = resultAny.resultSet;
        } else if (Array.isArray(result)) {
          rows = (result as any[]).map((row: any) => 
            Array.isArray(row) ? row : Object.values(row || {})
          );
        } else if (resultAny.rows) {
          rows = Array.isArray(resultAny.rows) ? resultAny.rows : [resultAny.rows];
        }
      }
      
      // Ensure rows are array of arrays
      rows = rows.map(row => Array.isArray(row) ? row : [row]);
      
      return {
        columns,
        rows,
        totalRows: rows.length
      };
    } catch (error: any) {
      throw new Error(`Query execution failed: ${error?.message || error}`);
    }
  }
  
  async *streamTableData(
    catalog: string, 
    schema: string, 
    table: string, 
    options: { limit?: number; batchSize?: number } = {}
  ): AsyncGenerator<{
    columns?: Array<{ name: string; type: string }>;
    rows: any[][];
    progress: { current: number; total?: number };
  }> {
    await this.ensureConnected();
    
    const { limit = 100000, batchSize = 10000 } = options;
    
    let columns: Array<{ name: string; type: string }> | undefined;
    let offset = 0;
    let totalProcessed = 0;
    
    while (totalProcessed < limit) {
      const currentBatchSize = Math.min(batchSize, limit - totalProcessed);
      
      const sql = `SELECT * FROM \`${catalog}\`.\`${schema}\`.\`${table}\` LIMIT ${currentBatchSize} OFFSET ${offset}`;
      const result = await this.executeQuery(sql);
      
      // Set columns from first batch
      if (!columns && result.columns.length > 0) {
        columns = result.columns;
      }
      
      // If no rows returned, we're done
      if (result.rows.length === 0) {
        break;
      }
      
      totalProcessed += result.rows.length;
      offset += result.rows.length;
      
      yield {
        columns: totalProcessed === result.rows.length ? columns : undefined, // Only include columns in first batch
        rows: result.rows,
        progress: { current: totalProcessed }
      };
      
      // If we got fewer rows than requested, we've reached the end
      if (result.rows.length < currentBatchSize) {
        break;
      }
    }
  }
  
  async importTable(
    tableName: string,
    options: { sampleRows?: number; userId: string }
  ): Promise<{ datasetId: string }> {
    await this.ensureConnected();
    
    const { sampleRows = 1000, userId } = options;
    
    // Import table data using existing import functionality
    const { importFromDatabricksTable } = await import('~/usecases/import-from-databricks.usecase');
    
    const result = await importFromDatabricksTable({
      connection: {
        id: this.connection.id,
        host: this.connection.host,
        httpPath: this.connection.httpPath,
        token: this.connection.token,
      },
      tableName,
      userId,
      sampleRows,
    });
    
    return result;
  }

  async close(): Promise<void> {
    await this.disconnect();
  }
  
  private async ensureConnected(): Promise<void> {
    if (!this.session) {
      await this.connect();
    }
  }
}