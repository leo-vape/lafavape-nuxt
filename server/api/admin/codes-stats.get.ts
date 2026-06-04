import { codeDb } from '../../utils/database'

export default defineEventHandler(() => {
  const row = codeDb.prepare('SELECT COUNT(*) as total, SUM(query_count) as total_queries FROM codes').get() as any
  return {
    total: row?.total || 0,
    total_queries: row?.total_queries || 0
  }
})
