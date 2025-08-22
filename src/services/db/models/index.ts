import { db } from '~/services/db';

export * from './dataset';
export * from './column';
export * from './cell';
export * from './process';

// Import databricks-connection to ensure model is initialized, but don't export
// to avoid bundling @databricks/sql in client-side code.
import './databricks-connection';

await db.sync({});
