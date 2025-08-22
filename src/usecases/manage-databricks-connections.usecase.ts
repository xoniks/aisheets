import { type RequestEventBase, server$ } from '@builder.io/qwik-city';
import { useServerSession } from '~/state';
import consola from 'consola';

export interface ConnectionAction {
  type: 'create' | 'list' | 'test' | 'delete';
  connectionId?: string;
  connectionData?: {
    name: string;
    host: string;
    httpPath: string;
    token: string;
    defaultCatalog?: string;
    defaultSchema?: string;
  };
}

export interface ConnectionResult {
  type: 'connection' | 'connections' | 'test_result' | 'success' | 'error';
  data?: any;
  error?: string;
}

export const useManageDatabricksConnections = () =>
  server$(async function* (
    this: RequestEventBase<QwikCityPlatform>,
    action: ConnectionAction
  ): AsyncGenerator<ConnectionResult> {
    const session = useServerSession(this);
    
    try {
      switch (action.type) {
        case 'list': {
          consola.info('Listing Databricks connections', { user: session.user.username });
          const { listUserConnections } = await import('~/services/repository/databricks/connections');
          const connections = await listUserConnections(session.user.username);
          yield { type: 'connections', data: connections };
          break;
        }
          
        case 'create': {
          if (!action.connectionData) {
            throw new Error('Connection data required for create action');
          }
          
          consola.info('Creating Databricks connection', { 
            name: action.connectionData.name,
            host: action.connectionData.host,
            user: session.user.username 
          });
          
          const { createDatabricksConnection } = await import('~/services/repository/databricks/connections');
          const newConnection = await createDatabricksConnection({
            userId: session.user.username,
            ...action.connectionData
          });
          
          yield { type: 'connection', data: newConnection };
          break;
        }
          
        case 'test': {
          if (!action.connectionId) {
            throw new Error('Connection ID required for test action');
          }
          
          consola.info('Testing Databricks connection', { 
            connectionId: action.connectionId,
            user: session.user.username 
          });
          
          // Show testing in progress
          yield { type: 'test_result', data: { testing: true } };
          
          const { testConnection } = await import('~/services/repository/databricks/connections');
          const testResult = await testConnection(
            action.connectionId,
            session.user.username
          );
          
          consola.info('Databricks connection test result', { 
            connectionId: action.connectionId,
            success: testResult.success,
            latencyMs: testResult.latencyMs 
          });
          
          yield { type: 'test_result', data: testResult };
          break;
        }
          
        case 'delete': {
          if (!action.connectionId) {
            throw new Error('Connection ID required for delete action');
          }
          
          consola.info('Deleting Databricks connection', { 
            connectionId: action.connectionId,
            user: session.user.username 
          });
          
          const { deleteConnection } = await import('~/services/repository/databricks/connections');
          await deleteConnection(
            action.connectionId,
            session.user.username
          );
          
          yield { type: 'success', data: { deleted: true } };
          break;
        }
          
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    } catch (error: any) {
      consola.error('Databricks connection management failed', { 
        action: action.type, 
        error: error?.message || error,
        user: session.user.username 
      });
      yield { type: 'error', error: error?.message || error };
    }
  });