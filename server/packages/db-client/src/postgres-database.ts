import {
  Pool,
  type PoolClient,
  type PoolConfig,
  type QueryConfig,
  type QueryResult,
  type QueryResultRow,
} from 'pg';

export interface QueryExecutor {
  query<Row extends QueryResultRow = QueryResultRow>(
    query: string | QueryConfig,
    values?: unknown[],
  ): Promise<QueryResult<Row>>;
}

export type TransactionWork<Result> = (
  transaction: QueryExecutor,
) => Promise<Result>;

export interface PostgresDatabaseOptions {
  connectionString: string;
  applicationName: string;
  connectionTimeoutMillis?: number;
  idleTimeoutMillis?: number;
  maxConnections?: number;
}

export class PostgresDatabase implements QueryExecutor {
  private readonly pool: Pool;

  constructor(options: PostgresDatabaseOptions) {
    if (!options.connectionString) {
      throw new Error('A PostgreSQL connection string is required.');
    }
    if (!options.applicationName) {
      throw new Error('A PostgreSQL application name is required.');
    }

    const poolConfig: PoolConfig = {
      connectionString: options.connectionString,
      application_name: options.applicationName,
      connectionTimeoutMillis: options.connectionTimeoutMillis ?? 5_000,
      idleTimeoutMillis: options.idleTimeoutMillis ?? 30_000,
      max: options.maxConnections ?? 10,
    };
    this.pool = new Pool(poolConfig);
  }

  query<Row extends QueryResultRow = QueryResultRow>(
    query: string | QueryConfig,
    values?: unknown[],
  ): Promise<QueryResult<Row>> {
    return this.pool.query<Row>(query, values);
  }

  async transaction<Result>(work: TransactionWork<Result>): Promise<Result> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(new PoolClientQueryExecutor(client));
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async isReady(): Promise<boolean> {
    await this.pool.query('SELECT 1');
    return true;
  }

  close(): Promise<void> {
    return this.pool.end();
  }
}

class PoolClientQueryExecutor implements QueryExecutor {
  constructor(private readonly client: PoolClient) {}

  query<Row extends QueryResultRow = QueryResultRow>(
    query: string | QueryConfig,
    values?: unknown[],
  ): Promise<QueryResult<Row>> {
    return this.client.query<Row>(query, values);
  }
}
