/**
 * Supabase PostgreSQL Database Client
 * Handles raw SQL queries for production and development
 */

import { Pool, QueryResult } from 'pg'

// Database connection
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set. Please configure Supabase connection.')
    }
    
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20, // Maximum number of clients in pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
    
    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err)
    })
  }
  
  return pool
}

/**
 * Convert SQLite SQL to PostgreSQL SQL
 */
function convertSQLiteToPostgres(sql: string): string {
  return sql
    // Date/Time functions
    .replace(/datetime\('now'\)/gi, 'NOW()')
    .replace(/date\('now'\)/gi, 'CURRENT_DATE')
    .replace(/datetime\('now',\s*'localtime'\)/gi, 'NOW()')
    .replace(/date\('now',\s*'localtime'\)/gi, 'CURRENT_DATE')
    
    // strftime conversions
    .replace(/strftime\('%Y-%m-%d',\s*([^)]+)\)/gi, "TO_CHAR($1, 'YYYY-MM-DD')")
    .replace(/strftime\('%H',\s*([^)]+)\)/gi, "TO_CHAR($1, 'HH24')")
    .replace(/strftime\('%w',\s*([^)]+)\)/gi, "EXTRACT(DOW FROM $1)")
    .replace(/strftime\('%Y',\s*([^)]+)\)/gi, "EXTRACT(YEAR FROM $1)")
    .replace(/strftime\('%m',\s*([^)]+)\)/gi, "EXTRACT(MONTH FROM $1)")
    
    // Date arithmetic - SQLite style to PostgreSQL interval
    .replace(/datetime\(([^,]+),\s*'([+-]\d+)\s+days?'\)/gi, "($1::timestamp + INTERVAL '$2 days')")
    .replace(/datetime\(([^,]+),\s*'([+-]\d+)\s+hours?'\)/gi, "($1::timestamp + INTERVAL '$2 hours')")
    .replace(/date\(([^,]+),\s*'([+-]\d+)\s+days?'\)/gi, "($1::date + INTERVAL '$2 days')")
    
    // Boolean values
    .replace(/\s+= 1\b/g, ' = true')
    .replace(/\s+= 0\b/g, ' = false')
    .replace(/\s+!= 1\b/g, ' != true')
    .replace(/\s+!= 0\b/g, ' != false')
    
    // AUTOINCREMENT -> SERIAL (already in schema, just for reference)
    .replace(/INTEGER\s+PRIMARY\s+KEY\s+AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY')
    
    // SQLite || (string concatenation) is same in PostgreSQL, no change needed
    
    // IFNULL -> COALESCE
    .replace(/IFNULL\(/gi, 'COALESCE(')
}

/**
 * Execute a SQL query with parameters
 */
async function query<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const pgPool = getPool()
  
  try {
    // Convert SQLite SQL to PostgreSQL
    const convertedSql = convertSQLiteToPostgres(sql)
    
    // Convert ? placeholders to $1, $2, etc.
    let paramIndex = 1
    const pgSql = convertedSql.replace(/\?/g, () => `$${paramIndex++}`)
    
    const result: QueryResult = await pgPool.query(pgSql, params)
    return result.rows as T[]
  } catch (error: any) {
    console.error('Query execution error:', error.message)
    console.error('Original SQL:', sql)
    console.error('Converted SQL:', convertSQLiteToPostgres(sql))
    console.error('Params:', params)
    throw error
  }
}

/**
 * Execute a single query and return one result
 */
async function queryOne<T = any>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const results = await query<T>(sql, params)
  return results.length > 0 ? results[0] : null
}

/**
 * Execute a query that doesn't return results (INSERT, UPDATE, DELETE)
 */
async function execute(
  sql: string,
  params: any[] = []
): Promise<void> {
  await query(sql, params)
}

/**
 * Execute multiple statements in a transaction
 */
async function transaction(
  queries: Array<{ sql: string; params?: any[] }>
): Promise<void> {
  const pgPool = getPool()
  const client = await pgPool.connect()
  
  try {
    await client.query('BEGIN')
    
    for (const { sql, params = [] } of queries) {
      const convertedSql = convertSQLiteToPostgres(sql)
      let paramIndex = 1
      const pgSql = convertedSql.replace(/\?/g, () => `$${paramIndex++}`)
      await client.query(pgSql, params)
    }
    
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Transaction failed:', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Close database connection pool
 */
async function close(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

// Compatibility layer - mimic better-sqlite3 prepare().get() and .all() API
export const db = {
  prepare: (sql: string) => ({
    get: async (...params: any[]) => queryOne(sql, params),
    all: async (...params: any[]) => query(sql, params),
    run: async (...params: any[]) => execute(sql, params),
  }),
  exec: async (sql: string) => {
    // Execute multiple statements separated by semicolons
    const statements = sql.split(';').filter(s => s.trim())
    for (const stmt of statements) {
      if (stmt.trim()) {
        await execute(stmt.trim(), [])
      }
    }
  },
  close,
}

// Export methods directly
export { query, queryOne, execute, transaction }

