import { DatabricksClient } from '~/services/databricks/client';
import * as connectionsRepo from './connections';

export async function listSchemas(connectionId: string, userId: string): Promise<string[]> {
  const client = await connectionsRepo.getDatabricksClient(connectionId, userId);

  try {
    const schemas = await client.listSchemas();
    return schemas;
  } finally {
    await client.close();
  }
}

export async function listTables(
  connectionId: string, 
  schema: string, 
  userId: string
): Promise<string[]> {
  const client = await connectionsRepo.getDatabricksClient(connectionId, userId);

  try {
    const tables = await client.listTables(schema);
    return tables;
  } finally {
    await client.close();
  }
}

export async function importTable(
  connectionId: string,
  schema: string,
  table: string,
  userId: string,
  options: { sampleRows?: number } = {}
): Promise<{ datasetId: string }> {
  const client = await connectionsRepo.getDatabricksClient(connectionId, userId);

  try {
    const fullTableName = `${schema}.${table}`;
    const { sampleRows = 1000 } = options;
    
    const result = await client.importTable(fullTableName, {
      sampleRows,
      userId,
    });
    
    return result;
  } finally {
    await client.close();
  }
}