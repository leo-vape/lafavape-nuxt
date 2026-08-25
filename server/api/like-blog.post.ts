import { getDb } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id } = body || {}

  if (!id) throw createError({ statusCode: 400, message: 'Missing blog id' })

  const db = getDb()
  let likes = 0
  if (db) {
    try {
      await db.execute({
        sql: `INSERT INTO blog_likes (blog_id, likes)
              VALUES (?, 1)
              ON CONFLICT(blog_id) DO UPDATE SET
                likes = likes + 1,
                updated_at = datetime('now')`,
        args: [String(id)]
      })
      const r = await db.execute({
        sql: 'SELECT likes FROM blog_likes WHERE blog_id = ?',
        args: [String(id)]
      })
      likes = Number((r.rows[0] as any)?.likes) || 0
    } catch (e: any) {
      console.error('Like insert failed:', e.message)
    }
  }

  return { success: true, likes }
})
