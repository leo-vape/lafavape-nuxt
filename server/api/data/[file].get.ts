export default defineEventHandler(async (event) => {
  const file = getRouterParam(event, 'file')
  if (!file) throw createError({ statusCode: 400, message: 'Missing file parameter' })

  try {
    const assets = useStorage('assets:data')
    const raw = await assets.getItem(`${file}.json`) as string
    if (!raw) throw createError({ statusCode: 404, message: 'File not found' })
    return typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch (e: any) {
    console.error(`Data API error (${file}):`, e.message)
    throw createError({ statusCode: 500, message: 'Error reading data' })
  }
})
