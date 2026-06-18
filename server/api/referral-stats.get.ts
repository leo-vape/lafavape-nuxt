import { readJsonFile, getDataPath } from '../utils/fileUtils'

export default defineEventHandler(async () => {
  const data = await readJsonFile(getDataPath('referral-stats'))
  return data || { total: 0, shares: 0, visits: 0, referrers: {} }
})
