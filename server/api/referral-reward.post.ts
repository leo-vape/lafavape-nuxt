import { readJsonFile, writeJsonFile, getDataPath } from '../utils/fileUtils'

// Claim a reward — user submits contact info
export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const { userId, tier, title, contact } = body as any

  if (!userId || !tier || !contact) {
    throw createError({ statusCode: 400, message: 'Missing fields' })
  }

  const data = await readJsonFile(getDataPath('reward-claims')) || []
  data.push({
    userId,
    tier,
    title,
    contact,
    claimedAt: new Date().toISOString(),
    status: 'pending'
  })

  await writeJsonFile(getDataPath('reward-claims'), data)
  return { success: true, message: 'Reward claimed! We will contact you soon.' }
})

