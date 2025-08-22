import { DatabricksConnectionModel } from '~/services/db/models/databricks-connection';
import { encrypt, decrypt, validateToken, validateHost, validateHttpPath } from '~/services/databricks/credential-manager';
import { DatabricksClient } from '~/services/databricks/client';

export interface CreateConnectionParams {
  userId: string;
  name: string;
  host: string;
  httpPath: string;
  token: string;
  defaultCatalog?: string;
  defaultSchema?: string;
}

export interface DatabricksConnection {
  id: string;
  name: string;
  host: string;
  httpPath: string;
  defaultCatalog?: string;
  defaultSchema?: string;
  isActive: boolean;
  lastConnected?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConnectionTestResult {
  success: boolean;
  version?: string;
  error?: string;
  latencyMs?: number;
}

export const createDatabricksConnection = async (
  params: CreateConnectionParams
): Promise<DatabricksConnection> => {
  // Validate inputs
  if (!validateToken(params.token)) {
    throw new Error('Invalid Databricks token format');
  }
  
  if (!validateHost(params.host)) {
    throw new Error('Invalid Databricks host format');
  }
  
  if (!validateHttpPath(params.httpPath)) {
    throw new Error('Invalid HTTP path format');
  }
  
  const encryptedToken = await encrypt(params.token);
  
  const connection = await DatabricksConnectionModel.create({
    userId: params.userId,
    name: params.name,
    host: params.host,
    httpPath: params.httpPath,
    encryptedToken,
    defaultCatalog: params.defaultCatalog,
    defaultSchema: params.defaultSchema,
    isActive: true
  });
  
  return {
    id: connection.id,
    name: connection.name,
    host: connection.host,
    httpPath: connection.httpPath,
    defaultCatalog: connection.defaultCatalog,
    defaultSchema: connection.defaultSchema,
    isActive: connection.isActive,
    lastConnected: connection.lastConnected,
    createdAt: connection.createdAt,
    updatedAt: connection.updatedAt
  };
};

export const listUserConnections = async (
  userId: string
): Promise<DatabricksConnection[]> => {
  const connections = await DatabricksConnectionModel.findAll({
    where: { userId, isActive: true },
    order: [['name', 'ASC']]
  });
  
  return connections.map(conn => ({
    id: conn.id,
    name: conn.name,
    host: conn.host,
    httpPath: conn.httpPath,
    defaultCatalog: conn.defaultCatalog,
    defaultSchema: conn.defaultSchema,
    isActive: conn.isActive,
    lastConnected: conn.lastConnected,
    createdAt: conn.createdAt,
    updatedAt: conn.updatedAt
  }));
};

export const getConnection = async (
  connectionId: string,
  userId: string
): Promise<DatabricksConnection | null> => {
  const connection = await DatabricksConnectionModel.findOne({
    where: { id: connectionId, userId, isActive: true }
  });
  
  if (!connection) {
    return null;
  }
  
  return {
    id: connection.id,
    name: connection.name,
    host: connection.host,
    httpPath: connection.httpPath,
    defaultCatalog: connection.defaultCatalog,
    defaultSchema: connection.defaultSchema,
    isActive: connection.isActive,
    lastConnected: connection.lastConnected,
    createdAt: connection.createdAt,
    updatedAt: connection.updatedAt
  };
};

export const testConnection = async (
  connectionId: string,
  userId: string
): Promise<ConnectionTestResult> => {
  // Check if Databricks client is available
  if (!DatabricksClient.isAvailable()) {
    return {
      success: false,
      error: 'Databricks client is not available. This may be due to missing native dependencies (LZ4).'
    };
  }

  const connection = await DatabricksConnectionModel.findOne({
    where: { id: connectionId, userId, isActive: true }
  });
  
  if (!connection) {
    throw new Error('Connection not found');
  }
  
  const token = await decrypt(connection.encryptedToken);
  
  let result: any;
  let latencyMs: number;
  
  try {
    const client = new DatabricksClient({
      id: connection.id,
      host: connection.host,
      httpPath: connection.httpPath,
      token,
      defaultCatalog: connection.defaultCatalog,
      defaultSchema: connection.defaultSchema
    });
    
    const startTime = Date.now();
    result = await client.testConnection();
    latencyMs = Date.now() - startTime;
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to create Databricks client: ${error?.message || error}`
    };
  }
  
  // Update last connected timestamp on successful test
  if (result.success) {
    await connection.update({ lastConnected: new Date() });
  }
  
  return { ...result, latencyMs };
};

export const getDatabricksClient = async (
  connectionId: string,
  userId: string
): Promise<DatabricksClient> => {
  // Check if Databricks client is available
  if (!DatabricksClient.isAvailable()) {
    throw new Error('Databricks client is not available. This may be due to missing native dependencies (LZ4).');
  }

  const connection = await DatabricksConnectionModel.findOne({
    where: { id: connectionId, userId, isActive: true }
  });
  
  if (!connection) {
    throw new Error('Connection not found or inactive');
  }
  
  const token = await decrypt(connection.encryptedToken);
  
  return new DatabricksClient({
    id: connection.id,
    host: connection.host,
    httpPath: connection.httpPath,
    token,
    defaultCatalog: connection.defaultCatalog,
    defaultSchema: connection.defaultSchema
  });
};

export const deleteConnection = async (
  connectionId: string,
  userId: string
): Promise<void> => {
  const connection = await DatabricksConnectionModel.findOne({
    where: { id: connectionId, userId, isActive: true }
  });
  
  if (!connection) {
    throw new Error('Connection not found');
  }
  
  // Soft delete - set isActive to false
  await connection.update({ isActive: false });
};

// Alias exports for consistency
export const listConnections = listUserConnections;
export const createConnection = createDatabricksConnection;