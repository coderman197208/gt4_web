import '../../loadEnv.js';
import pg from 'pg-opengauss';

const { Pool } = pg;

export interface SqlFragment {
  text: string;
  values: unknown[];
}

export type SqlExecutor = {
  query: (
    text: string,
    values?: unknown[],
  ) => Promise<{ rows: unknown[]; rowCount: number | null }>;
};

function isSqlFragment(value: unknown): value is SqlFragment {
  return (
    typeof value === 'object' &&
    value !== null &&
    'text' in value &&
    'values' in value &&
    Array.isArray((value as SqlFragment).values)
  );
}

function buildFragment(strings: TemplateStringsArray, values: readonly unknown[]): SqlFragment {
  let text = '';
  const parameters: unknown[] = [];

  strings.forEach((segment, index) => {
    text += segment;

    if (index >= values.length) {
      return;
    }

    const value = values[index];
    if (isSqlFragment(value)) {
      const baseIndex = parameters.length;
      text += value.text.replace(/\$(\d+)/g, (_match, rawIndex: string) => {
        return `$${baseIndex + Number(rawIndex)}`;
      });
      parameters.push(...value.values);
      return;
    }

    parameters.push(value);
    text += `$${parameters.length}`;
  });

  return {
    text,
    values: parameters,
  };
}

export function sql(strings: TemplateStringsArray, ...values: unknown[]): SqlFragment {
  return buildFragment(strings, values);
}

export function rawSql(text: string): SqlFragment {
  return { text, values: [] };
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined');
}

const databaseUseSsl = process.env.DATABASE_USE_SSL === 'true';
const databaseSslRejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false';
const parsedDatabaseUrl = new URL(databaseUrl);

const pool = new Pool({
  host: parsedDatabaseUrl.hostname,
  port: parsedDatabaseUrl.port ? Number(parsedDatabaseUrl.port) : 5432,
  database: parsedDatabaseUrl.pathname.replace(/^\//, ''),
  user: decodeURIComponent(parsedDatabaseUrl.username),
  password: decodeURIComponent(parsedDatabaseUrl.password),
  ssl: databaseUseSsl
    ? {
        rejectUnauthorized: databaseSslRejectUnauthorized,
      }
    : undefined,
});

const databaseSchema = (() => {
  try {
    return parsedDatabaseUrl.searchParams.get('schema')?.trim() || null;
  } catch {
    return null;
  }
})();

if (databaseSchema && !/^[A-Za-z_][A-Za-z0-9_]*$/.test(databaseSchema)) {
  throw new Error('DATABASE_URL schema parameter contains unsupported characters');
}

pool.on('connect', (client: { query: (text: string, values?: unknown[]) => Promise<unknown> }) => {
  if (!databaseSchema) {
    return;
  }

  void client.query(`SET search_path TO ${databaseSchema}`);
});

export async function queryRows<T>(
  statement: SqlFragment,
  executor: SqlExecutor = pool,
): Promise<T[]> {
  const result = await executor.query(statement.text, statement.values);
  return result.rows as T[];
}

export async function execute(
  statement: SqlFragment,
  executor: SqlExecutor = pool,
): Promise<number> {
  const result = await executor.query(statement.text, statement.values);
  return result.rowCount ?? 0;
}

export async function withTransaction<T>(
  callback: (client: SqlExecutor) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
