import { Pool, type QueryResult, type QueryResultRow } from "pg";

declare global {
  var postgresPool: Pool | undefined;
}

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@db:5432/appdb";

const pool =
  globalThis.postgresPool ??
  new Pool({
    connectionString
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.postgresPool = pool;
}

export async function runQuery<T extends QueryResultRow>(
  text: string,
  values?: unknown[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, values);
}

