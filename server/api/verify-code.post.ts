import codesData from '../data/codes.json'
import { readJsonFile, writeJsonFile, getDataPath } from '../utils/fileUtils'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { code } = body || {}

  if (!code) throw createError({ statusCode: 400, message: 'Please enter a verification code' })

  const codes: any[] = Array.isArray(codesData) ? codesData : []
  const found = codes.find((c: any) => c.code?.toUpperCase() === code.toUpperCase())

  if (found) {
    const queryCount = (found.query_count || 0) + 1
    found.query_count = queryCount

    // Persist updated count back to the JSON file
    try {
      await writeJsonFile(getDataPath('codes'), codes)
    } catch {}

    return { valid: true, flavor: found.flavor || '', date: found.date || '', query_count: queryCount }
  }

  return { valid: false, flavor: '', date: '', query_count: 0 }
})
