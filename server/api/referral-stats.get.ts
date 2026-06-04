import { readJsonFile, writeJsonFile, getDataPath } from '../utils/fileUtils'

export default defineEventHandler(async () => {
  const data = await readJsonFile(getDataPath('referrals')) || { total: 0, products: {} }
  return data
})
