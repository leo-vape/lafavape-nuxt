import { codeDb } from '../../utils/database'

export default defineEventHandler(() => {
  return codeDb.prepare('SELECT code, flavor, date, query_count FROM codes ORDER BY query_count DESC LIMIT 100').all()
})
