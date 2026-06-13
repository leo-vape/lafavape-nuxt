export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { code } = body || {}

  if (!code) throw createError({ statusCode: 400, message: '请输入防伪码' })

  try {
    const assets = useStorage('assets:data')
    const raw = await assets.getItem('codes.json') as string
    const codes = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : []

    const found = Array.isArray(codes)
      ? codes.find((c: any) => c.code?.toUpperCase() === code.toUpperCase())
      : null

    if (found) {
      return {
        valid: true,
        flavor: found.flavor || '',
        date: found.date || '',
        query_count: found.query_count || 1
      }
    }
  } catch (e: any) {
    console.error('Verify code error:', e.message)
  }

  return {
    valid: false,
    flavor: '',
    date: '',
    query_count: 0
  }
})
