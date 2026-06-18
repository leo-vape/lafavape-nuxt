import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, tier, title, contact } = body || {}

  if (!userId || !tier || !contact) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  const rewardsPath = path.join(process.cwd(), 'server/data/rewards.txt')
  const entry = JSON.stringify({
    userId, tier, title, contact,
    timestamp: new Date().toISOString()
  })
  fs.appendFileSync(rewardsPath, entry + '\n')

  return { success: true, message: 'Reward claim recorded' }
})
