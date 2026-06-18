import { readJsonFile, writeJsonFile, getDataPath } from '../utils/fileUtils'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { refId, product, type } = body || {}

  const filePath = getDataPath('referral-stats')
  const stats = await readJsonFile(filePath) || { total: 0, shares: 0, visits: 0, referrers: {} }

  stats.total = (stats.total || 0) + 1
  if (type === 'share') stats.shares = (stats.shares || 0) + 1
  stats.visits = (stats.visits || 0) + 1

  if (refId) {
    if (!stats.referrers) stats.referrers = {}
    if (!stats.referrers[refId]) {
      stats.referrers[refId] = { visits: 0, shares: 0 }
    }
    stats.referrers[refId].visits = (stats.referrers[refId].visits || 0) + 1
    if (type === 'share') {
      stats.referrers[refId].shares = (stats.referrers[refId].shares || 0) + 1
    }
  }

  await writeJsonFile(filePath, stats)
  return { success: true }
})
