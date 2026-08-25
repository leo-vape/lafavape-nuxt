import codesData from '../data/codes.json'
import { getDb } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { code } = body || {}

  if (!code) throw createError({ statusCode: 400, message: 'Please enter a verification code' })

  const codes: any[] = Array.isArray(codesData) ? codesData : []
  const found = codes.find((c: any) => c.code?.toUpperCase() === code.toUpperCase())

  if (found) {
    const upper = String(found.code).toUpperCase()
    let queryCount = (found.query_count || 0) + 1

    const db = getDb()
    if (db) {
      try {
        await db.execute({
          sql: `INSERT INTO code_queries (code, query_count, last_queried_at)
                VALUES (?, 1, datetime('now'))
                ON CONFLICT(code) DO UPDATE SET
                  query_count = query_count + 1,
                  last_queried_at = datetime('now')`,
          args: [upper]
        })
        const r = await db.execute({
          sql: 'SELECT query_count FROM code_queries WHERE code = ?',
          args: [upper]
        })
        queryCount = Number((r.rows[0] as any)?.query_count) || queryCount
      } catch (e: any) {
        console.error('Verify insert failed:', e.message)
      }
    }

    return { valid: true, flavor: found.flavor || '', date: found.date || '', query_count: queryCount }
  }

  return { valid: false, flavor: '', date: '', query_count: 0 }
})
