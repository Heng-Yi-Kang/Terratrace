import { Pool, QueryResult, QueryResultRow } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('DATABASE_URL is missing in environment variables.')
}

export const pool = new Pool({
  connectionString,
})

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params)
}
