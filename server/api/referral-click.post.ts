import { getDb } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { refId, type } = body || {}

  const isShare = type === 'share'

  const db = getDb()
  if (db && refId) {
    try {
      await db.execute({
        sql: `INSERT INTO referrers (ref_id, visits, shares)
              VALUES (?, 1, ?)
              ON CONFLICT(ref_id) DO UPDATE SET
                visits = visits + 1,
                shares = shares + ?,
                updated_at = datetime('now')`,
        args: [String(refId), isShare ? 1 : 0, isShare ? 1 : 0]
      })
    } catch (e: any) {
      console.error('Referral insert failed:', e.message)
    }
  }

  return { success: true }
})
