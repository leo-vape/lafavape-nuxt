import { readJsonFile, getDataPath } from '../../utils/fileUtils'

export default defineEventHandler(async (event) => {
  const file = getRouterParam(event, 'file')
  if (!file) throw createError({ statusCode: 400, message: 'Missing file parameter' })

  // Try storage first (Vercel runtime), fallback to filesystem (build/prerender)
  try {
    const assets = useStorage('assets:data')
    const raw = await assets.getItem(`${file}.json`)
    if (raw) return typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {}

  // Fallback: direct file read
  const filePath = getDataPath(file)
  const data = await readJsonFile(filePath)
  if (data === null) throw createError({ statusCode: 404, message: 'File not found' })
  return data
})
