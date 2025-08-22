import { DatasetModel } from '~/services/db/models/dataset';
import { ColumnModel } from '~/services/db/models/column';
import { connectAndClose } from '~/services/db/duckdb';
import type { Dataset, Column, ColumnKind } from '~/state';
import { getDatabricksClient } from './connections';
import { getColumnName, getDatasetTableName, getDatasetRowSequenceName } from '../tables/utils';

export interface ImportDatabricksTableParams {
  connectionId: string;
  catalog: string;
  schema: string;
  table: string;
  datasetName: string;
  userId: string;
  limit?: number;
  onProgress?: (progress: { current: number; total?: number }) => Promise<void>;
}

export const importDatasetFromDatabricks = async (
  params: ImportDatabricksTableParams
): Promise<Dataset> => {
  const {
    connectionId,
    catalog,
    schema,
    table,
    datasetName,
    userId,
    limit = 10000,
    onProgress
  } = params;

  // Step 1: Create the dataset record
  const datasetModel = await DatasetModel.create({
    name: datasetName,
    createdBy: userId,
  });

  try {
    // Step 2: Get Databricks client and table info
    const client = await getDatabricksClient(connectionId, userId);
    const tableInfo = await client.describeTable(catalog, schema, table);

    // Step 3: Create columns in database
    const dbColumns = await ColumnModel.bulkCreate(
      tableInfo.columns.map((column) => ({
        datasetId: datasetModel.id,
        name: column.name,
        type: column.type,
        kind: 'static' as ColumnKind,
      }))
    );

    // Step 4: Stream data from Databricks to DuckDB
    await connectAndClose(async (duckDb) => {
      const tableName = getDatasetTableName(datasetModel);
      const sequenceName = getDatasetRowSequenceName(datasetModel);

      // Create sequence for row indexing
      await duckDb.run(`CREATE OR REPLACE SEQUENCE ${sequenceName} START 0 INCREMENT 1 MINVALUE 0;`);

      // Prepare column names for DuckDB table
      const columnDefinitions = dbColumns
        .map((col) => `"${col.name}" VARCHAR`)
        .join(', ');

      // Create the DuckDB table
      await duckDb.run(`
        CREATE TABLE ${tableName} (
          ${columnDefinitions},
          rowIdx INTEGER DEFAULT nextval('${sequenceName}')
        );
      `);

      let totalProcessed = 0;

      // Stream data from Databricks
      for await (const batch of client.streamTableData(catalog, schema, table, {
        limit,
        batchSize: 1000
      })) {
        if (batch.rows.length === 0) break;

        // Prepare batch for insertion
        const values = batch.rows.map(row => {
          const escapedRow = row.map(value => {
            if (value === null || value === undefined) return 'NULL';
            return `'${String(value).replace(/'/g, "''")}'`; // Escape single quotes
          });
          return `(${escapedRow.join(', ')})`;
        });

        const columnNames = dbColumns.map(col => `"${col.name}"`).join(', ');
        const insertSql = `INSERT INTO ${tableName} (${columnNames}) VALUES ${values.join(', ')};`;

        await duckDb.run(insertSql);

        totalProcessed += batch.rows.length;

        // Report progress
        if (onProgress) {
          await onProgress({
            current: totalProcessed,
            total: tableInfo.rowCount
          });
        }
      }
    });

    // Step 5: Create the dataset response
    const columns: Column[] = dbColumns.map((column) => ({
      id: column.id,
      name: column.name,
      type: column.type,
      kind: column.kind as ColumnKind,
      visible: column.visible,
      dataset: {
        id: datasetModel.id,
        name: datasetModel.name,
        createdBy: datasetModel.createdBy,
      },
      cells: [], // Will be populated when needed
    }));

    return {
      id: datasetModel.id,
      name: datasetModel.name,
      createdBy: datasetModel.createdBy,
      columns,
      createdAt: datasetModel.createdAt,
      updatedAt: datasetModel.updatedAt,
      size: 0, // Will be calculated if needed
    };

  } catch (error: any) {
    // Clean up on error
    await datasetModel.destroy();
    throw new Error(`Failed to import from Databricks: ${error?.message || error}`);
  }
};