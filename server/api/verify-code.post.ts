import { readJsonFile, getDataPath } from '../utils/fileUtils'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { code } = body || {}

  if (!code) throw createError({ statusCode: 400, message: '请输入防伪码' })

  let codes: any[] = []

  try { const assets = useStorage('assets:data'); const raw = await assets.getItem('codes.json'); codes = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : []; } catch {}
  if (!codes.length) try { codes = await readJsonFile(getDataPath('codes')) || []; } catch {}

  const found = Array.isArray(codes)
    ? codes.find((c: any) => c.code?.toUpperCase() === code.toUpperCase())
    : null

  if (found) {
    return { valid: true, flavor: found.flavor || '', date: found.date || '', query_count: found.query_count || 1 }
  }

  return { valid: false, flavor: '', date: '', query_count: 0 }
})
