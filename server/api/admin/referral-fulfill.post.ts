import { readJsonFile, writeJsonFile, getDataPath } from '../../utils/fileUtils'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { index } = body || {}
  if (index === undefined) throw createError({ statusCode: 400, message: 'Missing index' })

  const claims = await readJsonFile(getDataPath('reward-claims')) || []
  if (!claims[index]) throw createError({ statusCode: 404, message: 'Claim not found' })

  claims[index].status = claims[index].status === 'fulfilled' ? 'pending' : 'fulfilled'
  await writeJsonFile(getDataPath('reward-claims'), claims)
  return { success: true, status: claims[index].status }
})
