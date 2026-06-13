import { readJsonFile, getDataPath } from '../utils/fileUtils'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { code } = body || {}

  if (!code) throw createError({ statusCode: 400, message: '请输入防伪码' })

  try {
    const codes = await readJsonFile(getDataPath('codes')) || []
    const found = codes.find((c: any) => c.code?.toUpperCase() === code.toUpperCase())

    if (found) {
      return {
        valid: true,
        flavor: found.flavor || '',
        date: found.date || '',
        query_count: found.query_count || 1
      }
    }
  } catch {}

  return {
    valid: false,
    flavor: '',
    date: '',
    query_count: 0
  }
})
