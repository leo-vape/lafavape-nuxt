import { codeDb } from '../../utils/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { code } = body || {}
  if (!code) throw createError({ statusCode: 400, message: '请输入防伪码' })

  const result = codeDb.prepare('DELETE FROM codes WHERE code = ?').run(code)
  if (result.changes === 0) {
    throw createError({ statusCode: 404, message: '防伪码不存在' })
  }

  return { success: true }
})
