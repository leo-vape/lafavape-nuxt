import { getDb } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, tier, title, contact } = body || {}

  if (!userId || !tier || !contact) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  const db = getDb()
  if (db) {
    try {
      await db.execute({
        sql: 'INSERT INTO reward_claims (user_id, tier, title, contact) VALUES (?, ?, ?, ?)',
        args: [String(userId), Number(tier), String(title || ''), String(contact)]
      })
    } catch (e: any) {
      console.error('Reward claim insert failed:', e.message)
    }
  }

  return { success: true, message: 'Reward claim recorded' }
})
