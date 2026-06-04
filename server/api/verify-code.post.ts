import { codeDb } from '../utils/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { code } = body || {}

  if (!code) throw createError({ statusCode: 400, message: '请输入防伪码' })

  const row = codeDb.prepare('SELECT code, flavor, date, query_count FROM codes WHERE code = ?').get(code) as any

  if (row) {
    const newCount = row.query_count + 1
    codeDb.prepare('UPDATE codes SET query_count = ? WHERE code = ?').run(newCount, code)
    return {
      valid: true,
      flavor: row.flavor,
      date: row.date,
      query_count: newCount
    }
  }

  return {
    valid: false,
    flavor: '',
    date: '',
    query_count: 0
  }
})
