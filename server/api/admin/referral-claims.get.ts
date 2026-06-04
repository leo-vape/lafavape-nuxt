import { readJsonFile, getDataPath } from '../../utils/fileUtils'

export default defineEventHandler(async () => {
  const referrals = await readJsonFile(getDataPath('referrals')) || { total: 0, shares: 0, visits: 0, referrers: {}, products: {} }
  const claims = await readJsonFile(getDataPath('reward-claims')) || []
  return { referrals, claims: claims.sort((a: any, b: any) => b.claimedAt.localeCompare(a.claimedAt)) }
})
