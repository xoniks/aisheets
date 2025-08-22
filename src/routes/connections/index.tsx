import { $, component$, useSignal, useStore, useTask$ } from '@builder.io/qwik';
import { Form, routeAction$, server$, useNavigate } from '@builder.io/qwik-city';
import { LuDatabase, LuHardDrive, LuTrash2, LuCheck, LuX } from '@qwikest/icons/lucide';
import { Button } from '~/components/ui/button/button';
import { Input } from '~/components/ui/input/input';
import { Label } from '~/components/ui/label/label';
import { useSession } from '~/loaders';

// Re-export the session loader for this route (required by Qwik)
export { useSession };

// Define connection interface to avoid importing Sequelize models on client
interface DatabricksConnection {
  id: string;
  name: string;
  host: string;
  httpPath: string;
}

const getDatabricksConnections = server$(async function() {
  const session = this.sharedMap.get('session') || this.sharedMap.get('anonymous');
  if (!session?.user?.username) return [];
  
  try {
    const { listUserConnections } = await import('~/services/repository/databricks/connections');
    return await listUserConnections(session.user.username);
  } catch (error) {
    console.error('Error fetching Databricks connections:', error);
    return [];
  }
});

const testDatabricksConnection = server$(async function(connectionId: string) {
  const session = this.sharedMap.get('session') || this.sharedMap.get('anonymous');
  if (!session?.user?.username) {
    return { success: false, error: 'Not authenticated' };
  }
  
  const { testConnection } = await import('~/services/repository/databricks/connections');
  return await testConnection(connectionId, session.user.username);
});

export const useDatabricksConnectionAction = routeAction$(async (data, requestEvent) => {
  const session = requestEvent.sharedMap.get('session') || requestEvent.sharedMap.get('anonymous');
  if (!session?.user?.username) {
    return { success: false, error: 'Not authenticated' };
  }

  const { name, host, httpPath, token } = data as {
    name: string;
    host: string;
    httpPath: string;
    token: string;
  };

  try {
    const { createConnection } = await import('~/services/repository/databricks/connections');
    const connection = await createConnection({
      name,
      host,
      httpPath,
      token,
      userId: session.user.username,
    });

    return { success: true, connection };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

const deleteDatabricksConnection = server$(async function(connectionId: string) {
  const session = this.sharedMap.get('session') || this.sharedMap.get('anonymous');
  if (!session?.user?.username) {
    return { success: false, error: 'Not authenticated' };
  }
  
  try {
    const { deleteConnection } = await import('~/services/repository/databricks/connections');
    await deleteConnection(connectionId, session.user.username);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

export default component$(() => {
  const nav = useNavigate();
  const session = useSession();
  const connectionAction = useDatabricksConnectionAction();
  
  const showDatabricksModal = useSignal(false);
  const connections = useSignal<DatabricksConnection[]>([]);
  const connectionTests = useStore<Record<string, { testing: boolean; result?: any }>>({});
  
  const formName = useSignal('');
  const formHost = useSignal('');
  const formHttpPath = useSignal('');
  const formToken = useSignal('');

  useTask$(async () => {
    connections.value = await getDatabricksConnections();
  });

  const handleDeleteConnection = $(async (connectionId: string) => {
    const result = await deleteDatabricksConnection(connectionId);
    if (result.success) {
      connections.value = connections.value.filter(conn => conn.id !== connectionId);
    } else {
      console.error('Failed to delete connection:', result.error);
    }
  });

  const handleTestConnection = $(async (connectionId: string) => {
    connectionTests[connectionId] = { testing: true };
    
    const result = await testDatabricksConnection(connectionId);
    connectionTests[connectionId] = { 
      testing: false, 
      result 
    };
  });

  const resetForm = $(() => {
    formName.value = '';
    formHost.value = '';
    formHttpPath.value = '';
    formToken.value = '';
  });

  return (
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold">Connections</h1>
          <p class="text-neutral-600 mt-2">
            Manage your data source connections
          </p>
        </div>
        <Button
          onClick$={() => nav('/')}
          look="secondary"
        >
          Back to Home
        </Button>
      </div>

      {/* Hugging Face Section */}
      <div class="mb-12">
        <div class="flex items-center gap-3 mb-6">
          <LuHardDrive class="w-6 h-6 text-primary-600" />
          <h2 class="text-2xl font-semibold">Hugging Face</h2>
        </div>
        
        <div class="bg-white border border-neutral-200 rounded-lg p-6">
          {session.value.anonymous ? (
            <div class="text-center py-8">
              <p class="text-neutral-600 mb-4">
                Connect to Hugging Face to access models and datasets
              </p>
              <Button
                onClick$={() => nav('/auth')}
                look="primary"
              >
                Connect to Hugging Face
              </Button>
            </div>
          ) : (
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <img 
                  src={session.value.user?.picture} 
                  alt={session.value.user?.name}
                  class="w-12 h-12 rounded-full"
                />
                <div>
                  <p class="font-semibold">{session.value.user?.name}</p>
                  <p class="text-sm text-neutral-600">@{session.value.user?.username}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 text-green-600">
                <LuCheck class="w-5 h-5" />
                <span class="text-sm font-medium">Connected</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Databricks Section */}
      <div>
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <LuDatabase class="w-6 h-6 text-orange-600" />
            <h2 class="text-2xl font-semibold">Databricks</h2>
          </div>
          <Button
            onClick$={() => showDatabricksModal.value = true}
            look="primary"
            disabled={session.value.anonymous}
          >
            Add Connection
          </Button>
        </div>

        {session.value.anonymous && (
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p class="text-yellow-800 text-sm">
              Please connect to Hugging Face first to manage Databricks connections.
            </p>
          </div>
        )}

        <div class="space-y-4">
          {connections.value.length === 0 ? (
            <div class="bg-white border border-neutral-200 rounded-lg p-8 text-center">
              <LuDatabase class="w-16 h-16 mx-auto text-neutral-300 mb-4" />
              <h3 class="text-lg font-semibold mb-2">No Databricks connections</h3>
              <p class="text-neutral-600">
                Add a connection to start importing data from your Databricks workspace
              </p>
            </div>
          ) : (
            connections.value.map((connection) => (
              <div key={connection.id} class="bg-white border border-neutral-200 rounded-lg p-6">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="text-lg font-semibold">{connection.name}</h3>
                      {connectionTests[connection.id]?.result && (
                        <span class={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          connectionTests[connection.id].result.success 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {connectionTests[connection.id].result.success ? (
                            <LuCheck class="w-3 h-3" />
                          ) : (
                            <LuX class="w-3 h-3" />
                          )}
                          {connectionTests[connection.id].result.success ? 'Connected' : 'Failed'}
                        </span>
                      )}
                    </div>
                    <p class="text-sm text-neutral-600 mb-1">
                      <span class="font-medium">Host:</span> {connection.host}
                    </p>
                    <p class="text-sm text-neutral-600">
                      <span class="font-medium">HTTP Path:</span> {connection.httpPath}
                    </p>
                  </div>
                  
                  <div class="flex items-center gap-3">
                    <Button
                      onClick$={() => handleTestConnection(connection.id)}
                      look="secondary"
                      size="sm"
                      disabled={connectionTests[connection.id]?.testing}
                    >
                      {connectionTests[connection.id]?.testing ? 'Testing...' : 'Test'}
                    </Button>
                    <Button
                      onClick$={() => handleDeleteConnection(connection.id)}
                      look="alert"
                      size="sm"
                    >
                      <LuTrash2 class="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Databricks Connection Modal */}
      {showDatabricksModal.value && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Add Databricks Connection</h3>
          
          <Form action={connectionAction} onSubmitCompleted$={() => {
            if (connectionAction.value?.success) {
              showDatabricksModal.value = false;
              resetForm();
              // Refresh connections
              getDatabricksConnections().then(result => {
                connections.value = result;
              });
            }
          }}>
            <div class="space-y-4">
              <div>
                <Label for="name">Connection Name</Label>
                <Input
                  id="name"
                  name="name"
                  bind:value={formName}
                  placeholder="My Databricks Workspace"
                  required
                />
              </div>

              <div>
                <Label for="host">Server Hostname</Label>
                <Input
                  id="host"
                  name="host"
                  bind:value={formHost}
                  placeholder="adb-1234567890123456.7.azuredatabricks.net"
                  required
                />
              </div>

              <div>
                <Label for="httpPath">HTTP Path</Label>
                <Input
                  id="httpPath"
                  name="httpPath"
                  bind:value={formHttpPath}
                  placeholder="/sql/1.0/warehouses/abcdef123456789"
                  required
                />
              </div>

              <div>
                <Label for="token">Access Token</Label>
                <Input
                  id="token"
                  name="token"
                  type="password"
                  bind:value={formToken}
                  placeholder="dapi..."
                  required
                />
              </div>

              {connectionAction.value?.error && (
                <div class="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p class="text-red-800 text-sm">{connectionAction.value.error}</p>
                </div>
              )}

              <div class="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  onClick$={() => {
                    showDatabricksModal.value = false;
                    resetForm();
                  }}
                  look="secondary"
                >
                  Cancel
                </Button>
                <Button type="submit" look="primary">
                  Add Connection
                </Button>
              </div>
            </div>
          </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});