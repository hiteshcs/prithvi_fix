const { Pool, Client } = require('pg');
const path = require('path');

// Ensure .env is loaded from backend directory and root directory
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

/**
 * Safely normalizes PostgreSQL connection URIs, ensuring that special characters
 * in passwords (e.g. '@', '#', '%', '!', '&', '$', '?') are properly percent-encoded for pg.
 * Especially crucial for Supabase passwords containing special characters.
 */
function normalizePostgresUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
  const trimmed = rawUrl.trim();
  const match = trimmed.match(/^(postgres(?:ql)?:\/\/)(.*)$/);
  if (!match) return trimmed;

  const proto = match[1];
  const rest = match[2];

  const lastAt = rest.lastIndexOf('@');
  if (lastAt === -1) return trimmed; // No credentials in URL

  const authPart = rest.substring(0, lastAt);
  const hostPart = rest.substring(lastAt + 1);

  const firstColon = authPart.indexOf(':');
  if (firstColon === -1) return trimmed; // Username only

  const rawUser = authPart.substring(0, firstColon);
  const rawPass = authPart.substring(firstColon + 1);

  let safeUser = rawUser;
  let safePass = rawPass;
  try {
    // Decode first to prevent double-encoding, then cleanly encode
    safeUser = encodeURIComponent(decodeURIComponent(rawUser));
    safePass = encodeURIComponent(decodeURIComponent(rawPass));
  } catch (_) {
    safeUser = encodeURIComponent(rawUser);
    safePass = encodeURIComponent(rawPass);
  }

  return `${proto}${safeUser}:${safePass}@${hostPart}`;
}

/**
 * Automatically rewrites direct Supabase connections (db.<ref>.supabase.co:5432),
 * which are IPv6-only and fail on Vercel/serverless with "ENOTFOUND", into the IPv4
 * Supavisor Connection Pooler URL (aws-0-<region>.pooler.supabase.com:6543).
 */
function resolveSupabaseDirectToPooler(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
  const lastAt = rawUrl.lastIndexOf('@');
  if (lastAt === -1) return rawUrl;
  const hostAndRest = rawUrl.substring(lastAt + 1);
  const authAndProto = rawUrl.substring(0, lastAt);

  const hostMatch = hostAndRest.match(/^db\.([a-z0-9]+)\.supabase\.co(?::\d+)?(\/.*)?$/i);
  if (hostMatch) {
    const projectRef = hostMatch[1];
    const pathAndQuery = hostMatch[2] || '/postgres';
    const region = process.env.SUPABASE_REGION || 'ap-south-1';

    const protoIndex = authAndProto.indexOf('://') + 3;
    const proto = authAndProto.substring(0, protoIndex);
    const credentials = authAndProto.substring(protoIndex);
    const firstColon = credentials.indexOf(':');
    if (firstColon !== -1) {
      let user = credentials.substring(0, firstColon);
      const pass = credentials.substring(firstColon + 1);
      if (!user.includes('.')) {
        user = `${user}.${projectRef}`;
      }
      const poolerHost = `aws-0-${region}.pooler.supabase.com:6543`;
      return `${proto}${user}:${pass}@${poolerHost}${pathAndQuery}`;
    }
  }
  return rawUrl;
}

/**
 * Retrieves and normalizes the database connection URL from all common environment variables
 * supported by Vercel, Supabase, Neon, and Render.
 */
function getResolvedConnectionString() {
  const rawUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.SUPABASE_DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (rawUrl) {
    const poolerUrl = resolveSupabaseDirectToPooler(rawUrl);
    return normalizePostgresUrl(poolerUrl);
  }
  return null;
}

/**
 * Detects if a host name belongs to a remote managed database (Supabase, AWS, Render, etc.)
 */
function isRemoteHost(host) {
  if (!host) return false;
  const h = host.toLowerCase();
  return (
    h.includes('supabase') ||
    h.includes('pooler') ||
    h.includes('amazonaws.com') ||
    h.includes('render.com') ||
    h.includes('neon.tech') ||
    h.includes('cockroachlabs.cloud') ||
    (h !== 'localhost' && h !== '127.0.0.1' && h !== '::1')
  );
}

const config = {
  user: process.env.PGUSER || process.env.DB_USER || 'postgres',
  host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
  password: process.env.PGPASSWORD || process.env.DB_PASSWORD || 'postgres',
  database: process.env.PGDATABASE || process.env.DB_NAME || 'sahakari_shramsetu',
  port: parseInt(process.env.PGPORT || process.env.DB_PORT || '5432', 10),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

const resolvedConnectionString = getResolvedConnectionString();
if (resolvedConnectionString) {
  config.connectionString = resolvedConnectionString;
}

let pool = global.__pg_pool || null;

/**
 * Ensure the target PostgreSQL database exists.
 * If not, connects to default 'postgres' database and creates it.
 */
async function ensureDatabaseExists() {
  const connStr = getResolvedConnectionString();
  // If running with a remote managed DATABASE_URL (e.g. Supabase, Render, Neon) or remote host, skip local DDL
  if (connStr || isRemoteHost(config.host)) {
    return;
  }

  const targetDb = config.database;
  const adminClient = new Client({
    user: config.user,
    host: config.host,
    password: config.password,
    port: config.port,
    database: 'postgres', // default maintenance db
  });

  try {
    await adminClient.connect();
    const res = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [targetDb]
    );

    if (res.rowCount === 0) {
      console.log(`🔨 Target database "${targetDb}" not found. Creating it now...`);
      // Database names cannot be parameterized in DDL
      const safeDbName = targetDb.replace(/[^a-zA-Z0-9_]/g, '');
      await adminClient.query(`CREATE DATABASE "${safeDbName}"`);
      console.log(`✅ Database "${safeDbName}" created successfully.`);
    }
  } catch (err) {
    // If user doesn't have permissions or using external managed db, log warning and continue
    console.warn(`ℹ️ Database check notice: ${err.message}`);
  } finally {
    try {
      await adminClient.end();
    } catch (_) { }
  }
}

/**
 * Get or initialize the PostgreSQL connection pool.
 */
function getPool() {
  if (!pool) {
    const connStr = getResolvedConnectionString();
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
    const maxConnections = parseInt(process.env.DB_MAX_CONNECTIONS || (isServerless ? '3' : '10'), 10);

    if (connStr) {
      const isSupabaseOrRemote = isRemoteHost(connStr) || connStr.includes('sslmode=require');
      pool = new Pool({
        connectionString: connStr,
        ssl: isSupabaseOrRemote ? { rejectUnauthorized: false } : (process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false),
        max: maxConnections,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
      });
      console.log(`📦 PostgreSQL Pool initialized with connection string (Remote/Supabase: ${isSupabaseOrRemote}, max: ${maxConnections})`);
    } else {
      const isRemote = isRemoteHost(config.host) || process.env.PGSSLMODE === 'require';
      pool = new Pool({
        user: config.user,
        host: config.host,
        password: config.password,
        database: config.database,
        port: config.port,
        ssl: isRemote ? { rejectUnauthorized: false } : false,
        max: maxConnections,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
      });
      console.log(`📦 PostgreSQL Pool initialized for database: ${config.database} @ ${config.host}:${config.port} (SSL: ${isRemote})`);
    }

    pool.on('error', (err) => {
      console.error('⚠️ Unexpected error on idle PostgreSQL client:', err.message);
    });

    global.__pg_pool = pool;
  }
  return pool;
}

/**
 * Helper to execute a query on the pool.
 * @param {string} text - SQL query string
 * @param {Array} [params] - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params) {
  const p = getPool();
  const start = Date.now();
  try {
    const res = await p.query(text, params);
    const duration = Date.now() - start;
    if (process.env.DEBUG_SQL === 'true') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (err) {
    console.error('❌ Database Query Error:', { text, params, error: err.message });
    throw err;
  }
}

/**
 * Gracefully close pool on shutdown.
 */
async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('📦 PostgreSQL Pool closed');
  }
}

// Graceful shutdown hooks
process.on('SIGINT', async () => {
  await closeDb();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDb();
  process.exit(0);
});

module.exports = {
  getPool,
  query,
  closeDb,
  ensureDatabaseExists,
  config,
  normalizePostgresUrl,
  getResolvedConnectionString
};

