import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import path from 'path'

export default defineEventHandler(async (event) => {
  const filepath = getRouterParam(event, 'path')
  if (!filepath || filepath.includes('..')) {
    throw createError({ statusCode: 404 })
  }

  const fullPath = path.join(process.cwd(), 'public', 'uploads', filepath)

  try {
    const st = await stat(fullPath)
    if (!st.isFile()) throw createError({ statusCode: 404 })

    const ext = path.extname(fullPath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.webp': 'image/webp',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    }
    const contentType = mimeTypes[ext] || 'application/octet-stream'

    setHeaders(event, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'Content-Length': st.size.toString(),
    })

    return sendStream(event, createReadStream(fullPath))
  } catch {
    throw createError({ statusCode: 404 })
  }
})
