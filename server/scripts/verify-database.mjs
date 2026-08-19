import assert from 'node:assert/strict';
import { PostgresDatabase } from '../packages/db-client/dist/index.js';

const database = new PostgresDatabase({
  connectionString:
    process.env.TEST_DATABASE_URL ??
    'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
  applicationName: 'roadtrip-database-verification',
  maxConnections: 1,
});

try {
  assert.equal(await database.isReady(), true);

  const transactionResult = await database.transaction(async (transaction) => {
    const result = await transaction.query('SELECT 1 AS value');
    return result.rows[0]?.value;
  });
  assert.equal(transactionResult, 1);

  const expectedError = new Error('expected rollback');
  await assert.rejects(
    database.transaction(async (transaction) => {
      await transaction.query(
        'CREATE TEMPORARY TABLE roadtrip_rollback_probe (id integer)',
      );
      throw expectedError;
    }),
    expectedError,
  );

  const rollbackResult = await database.query(
    "SELECT to_regclass('pg_temp.roadtrip_rollback_probe') AS relation",
  );
  assert.equal(rollbackResult.rows[0]?.relation, null);
} finally {
  await database.close();
}
