import { $, component$, useSignal, useTask$ } from '@builder.io/qwik';
import { server$, useNavigate } from '@builder.io/qwik-city';
import { LuArrowLeft, LuDatabase, LuTable, LuLoader2 } from '@qwikest/icons/lucide';
import { Button } from '~/components/ui/button/button';
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

const getDatabricksSchemas = server$(async function(connectionId: string) {
  const session = this.sharedMap.get('session') || this.sharedMap.get('anonymous');
  if (!session?.user?.username) return [];
  
  try {
    const { listSchemas } = await import('~/services/repository/databricks/tables');
    return await listSchemas(connectionId, session.user.username);
  } catch (error) {
    console.error('Error fetching schemas:', error);
    return [];
  }
});

const getDatabricksTables = server$(async function(connectionId: string, schema: string) {
  const session = this.sharedMap.get('session') || this.sharedMap.get('anonymous');
  if (!session?.user?.username) return [];
  
  try {
    const { listTables } = await import('~/services/repository/databricks/tables');
    return await listTables(connectionId, schema, session.user.username);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return [];
  }
});

const importDatabricksTable = server$(async function(
  connectionId: string,
  schema: string,
  table: string,
  sampleRows: number = 1000
) {
  const session = this.sharedMap.get('session') || this.sharedMap.get('anonymous');
  if (!session?.user?.username) {
    throw new Error('Not authenticated');
  }
  
  try {
    const { importTable } = await import('~/services/repository/databricks/tables');
    const result = await importTable(
      connectionId,
      schema,
      table,
      session.user.username,
      { sampleRows }
    );
    return result;
  } catch (error: any) {
    console.error('Error importing table:', error);
    throw new Error(error.message);
  }
});

export default component$(() => {
  const nav = useNavigate();
  const session = useSession();
  
  const connections = useSignal<DatabricksConnection[]>([]);
  const selectedConnection = useSignal<string>('');
  const schemas = useSignal<string[]>([]);
  const selectedSchema = useSignal<string>('');
  const tables = useSignal<string[]>([]);
  const selectedTable = useSignal<string>('');
  const sampleRows = useSignal<string>('1000');
  
  const loadingSchemas = useSignal(false);
  const loadingTables = useSignal(false);
  const importing = useSignal(false);
  const error = useSignal<string>('');

  // Load connections on mount
  useTask$(async () => {
    if (session.value.anonymous) {
      return;
    }
    
    connections.value = await getDatabricksConnections();
  });

  const handleConnectionChange = $(async (event: Event) => {
    const connectionId = (event.target as HTMLSelectElement).value;
    selectedConnection.value = connectionId;
    selectedSchema.value = '';
    selectedTable.value = '';
    schemas.value = [];
    tables.value = [];
    
    if (!connectionId) return;
    
    loadingSchemas.value = true;
    try {
      schemas.value = await getDatabricksSchemas(connectionId);
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loadingSchemas.value = false;
    }
  });

  const handleSchemaChange = $(async (event: Event) => {
    const schema = (event.target as HTMLSelectElement).value;
    selectedSchema.value = schema;
    selectedTable.value = '';
    tables.value = [];
    
    if (!schema || !selectedConnection.value) return;
    
    loadingTables.value = true;
    try {
      tables.value = await getDatabricksTables(selectedConnection.value, schema);
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loadingTables.value = false;
    }
  });

  const handleImport = $(async () => {
    if (!selectedConnection.value || !selectedSchema.value || !selectedTable.value) return;
    
    importing.value = true;
    error.value = '';
    
    try {
      const result = await importDatabricksTable(
        selectedConnection.value,
        selectedSchema.value,
        selectedTable.value,
        parseInt(sampleRows.value)
      );
      
      nav(`/home/dataset/${result.datasetId}`);
    } catch (err: any) {
      error.value = err.message;
    } finally {
      importing.value = false;
    }
  });

  if (session.value.anonymous) {
    return (
      <div class="container mx-auto px-4 py-8 max-w-2xl">
        <div class="text-center">
          <p class="text-neutral-600 mb-4">Please connect to Hugging Face first to access Databricks.</p>
          <Button onClick$={() => { nav('/connections'); }} look="primary">
            Go to Connections
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <div class="flex items-center gap-4 mb-8">
        <Button
          onClick$={() => { nav('/'); }}
          look="ghost"
          size="sm"
        >
          <LuArrowLeft class="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div class="flex items-center gap-3">
          <LuDatabase class="w-6 h-6 text-orange-600" />
          <h1 class="text-2xl font-semibold">Import from Databricks</h1>
        </div>
      </div>

      {connections.value.length === 0 ? (
        <div class="bg-white border border-neutral-200 rounded-lg p-8 text-center">
          <LuDatabase class="w-16 h-16 mx-auto text-neutral-300 mb-4" />
          <h3 class="text-lg font-semibold mb-2">No Databricks connections</h3>
          <p class="text-neutral-600 mb-4">
            You need to add a Databricks connection first.
          </p>
          <Button onClick$={() => { nav('/connections'); }} look="primary">
            Manage Connections
          </Button>
        </div>
      ) : (
        <div class="bg-white border border-neutral-200 rounded-lg p-6">
          <div class="space-y-6">
            {/* Connection Selection */}
            <div>
              <Label>Select Databricks Connection</Label>
              <select
                bind:value={selectedConnection}
                onChange$={handleConnectionChange}
                class="w-full p-2 border border-neutral-200 rounded-md"
              >
                <option value="">Choose a connection</option>
                {connections.value.map((conn) => (
                  <option key={conn.id} value={conn.id}>
                    {`${conn.name} (${conn.host})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Schema Selection */}
            {selectedConnection.value && (
              <div>
                <Label>Schema</Label>
                {loadingSchemas.value ? (
                  <div class="flex items-center gap-2 p-3 border border-neutral-200 rounded-md">
                    <LuLoader2 class="w-4 h-4 animate-spin" />
                    <span class="text-sm text-neutral-600">Loading schemas...</span>
                  </div>
                ) : (
                  <select
                    bind:value={selectedSchema}
                    onChange$={handleSchemaChange}
                    class="w-full p-2 border border-neutral-200 rounded-md"
                  >
                    <option value="">Choose a schema</option>
                    {schemas.value.map((schema) => (
                      <option key={schema} value={schema}>
                        {schema}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Table Selection */}
            {selectedSchema.value && (
              <div>
                <Label>Table</Label>
                {loadingTables.value ? (
                  <div class="flex items-center gap-2 p-3 border border-neutral-200 rounded-md">
                    <LuLoader2 class="w-4 h-4 animate-spin" />
                    <span class="text-sm text-neutral-600">Loading tables...</span>
                  </div>
                ) : (
                  <select
                    bind:value={selectedTable}
                    class="w-full p-2 border border-neutral-200 rounded-md"
                  >
                    <option value="">Choose a table</option>
                    {tables.value.map((table) => (
                      <option key={table} value={table}>
                        {table}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Sample Rows */}
            {selectedTable.value && (
              <div>
                <Label>Sample Rows (for preview)</Label>
                <select
                  bind:value={sampleRows}
                  class="w-full p-2 border border-neutral-200 rounded-md"
                >
                  <option value="100">100 rows</option>
                  <option value="500">500 rows</option>
                  <option value="1000">1,000 rows</option>
                  <option value="5000">5,000 rows</option>
                  <option value="10000">10,000 rows</option>
                </select>
                <p class="text-sm text-neutral-600 mt-1">
                  Import a sample to get started. You can load more data later.
                </p>
              </div>
            )}

            {/* Error Display */}
            {error.value && (
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <p class="text-red-800 text-sm">{error.value}</p>
              </div>
            )}

            {/* Import Button */}
            {selectedTable.value && (
              <div class="flex justify-end">
                <Button
                  onClick$={handleImport}
                  look="primary"
                  disabled={importing.value}
                >
                  {importing.value ? (
                    <>
                      <LuLoader2 class="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <LuTable class="w-4 h-4 mr-2" />
                      Import Table
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});