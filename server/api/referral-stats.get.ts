import { getDb } from '../utils/db'

export default defineEventHandler(async () => {
  const db = getDb()
  if (!db) return { total: 0, shares: 0, visits: 0, referrers: {} }

  try {
    const r = await db.execute('SELECT ref_id, visits, shares FROM referrers')
    const referrers: Record<string, { visits: number; shares: number }> = {}
    let shares = 0
    let visits = 0
    for (const row of r.rows as any[]) {
      referrers[row.ref_id] = {
        visits: Number(row.visits) || 0,
        shares: Number(row.shares) || 0
      }
      visits += Number(row.visits) || 0
      shares += Number(row.shares) || 0
    }
    // total 对应页面上的「总分享」
    return { total: shares, shares, visits, referrers }
  } catch (e: any) {
    console.error('Referral stats failed:', e.message)
    return { total: 0, shares: 0, visits: 0, referrers: {} }
  }
})
