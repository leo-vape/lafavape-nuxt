import { readJsonFile, writeJsonFile, getDataPath } from '../utils/fileUtils'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const { product, type, refId } = body as any

  const data = await readJsonFile(getDataPath('referrals')) || { total: 0, shares: 0, visits: 0, referrers: {}, products: {} }
  data.total = (data.total || 0) + 1

  if (type === 'visit') {
    data.visits = (data.visits || 0) + 1
    // Attribute visit to the referrer
    if (refId) {
      if (!data.referrers[refId]) data.referrers[refId] = { visits: 0, rewards: 0 }
      data.referrers[refId].visits = (data.referrers[refId].visits || 0) + 1
    }
  } else {
    data.shares = (data.shares || 0) + 1
    if (refId) {
      if (!data.referrers[refId]) data.referrers[refId] = { visits: 0, rewards: 0 }
    }
  }

  await writeJsonFile(getDataPath('referrals'), data)
  return { success: true, ...data }
})
