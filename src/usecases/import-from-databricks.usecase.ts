import { type RequestEventBase, server$ } from '@builder.io/qwik-city';
import { type Dataset, useServerSession } from '~/state';
import consola from 'consola';
import { importDatasetFromDatabricks } from '~/services/repository/databricks/import-table';

export interface ImportFromDatabricksParams {
  connectionId: string;
  catalog: string;
  schema: string;
  table: string;
  datasetName: string;
  limit?: number;
}

export interface ImportProgress {
  type: 'progress' | 'dataset' | 'error';
  data?: any;
  error?: string;
}

export const useImportFromDatabricks = () =>
  server$(async function* (
    this: RequestEventBase<QwikCityPlatform>,
    params: ImportFromDatabricksParams
  ): AsyncGenerator<ImportProgress> {
    const session = useServerSession(this);
    
    try {
      const {
        connectionId,
        catalog,
        schema,
        table,
        datasetName,
        limit = 10000
      } = params;

      consola.info('Starting Databricks import', { 
        catalog, 
        schema, 
        table, 
        datasetName,
        user: session.user.username 
      });

      // Start the import process
      yield { 
        type: 'progress', 
        data: { 
          step: 'Connecting to Databricks...', 
          progress: 0 
        } 
      };

      // Start the import process (simplified without complex progress for now)
      yield { 
        type: 'progress', 
        data: { 
          step: 'Starting data import...', 
          progress: 25 
        } 
      };

      const dataset = await importDatasetFromDatabricks({
        connectionId,
        catalog,
        schema,
        table,
        datasetName,
        userId: session.user.username,
        limit
        // Note: Removed onProgress callback for now to fix TypeScript issues
      });

      yield { 
        type: 'progress', 
        data: { 
          step: 'Processing imported data...', 
          progress: 75 
        } 
      };

      // Final progress update
      yield { 
        type: 'progress', 
        data: { 
          step: 'Import completed successfully!', 
          progress: 100 
        } 
      };

      consola.info('Databricks import completed', { 
        datasetId: dataset.id, 
        columns: dataset.columns.length 
      });

      // Return the completed dataset
      yield { type: 'dataset', data: dataset };

    } catch (error: any) {
      consola.error('Databricks import failed', { error: error?.message || error, params });
      yield { type: 'error', error: error?.message || error };
    }
  });

// Simple import function for direct table import
export interface ImportTableParams {
  connection: {
    id: string;
    host: string;
    httpPath: string;
    token: string;
  };
  tableName: string;
  userId: string;
  sampleRows: number;
}

export async function importFromDatabricksTable(
  params: ImportTableParams
): Promise<{ datasetId: string }> {
  const { connection, tableName, userId, sampleRows } = params;
  
  // Parse full table name (assuming format: schema.table or catalog.schema.table)
  const tableParts = tableName.split('.');
  let catalog = 'main'; // Default catalog
  let schema: string;
  let table: string;
  
  if (tableParts.length === 2) {
    [schema, table] = tableParts;
  } else if (tableParts.length === 3) {
    [catalog, schema, table] = tableParts;
  } else {
    throw new Error('Invalid table name format. Use schema.table or catalog.schema.table');
  }

  const dataset = await importDatasetFromDatabricks({
    connectionId: connection.id,
    catalog,
    schema,
    table,
    datasetName: `${schema}_${table}`,
    userId,
    limit: sampleRows
  });

  return { datasetId: dataset.id };
}