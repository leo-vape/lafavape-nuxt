import { readJsonFile, writeJsonFile, getDataPath } from '../../utils/fileUtils'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, code } = body || {}

  if (!email || !code) throw createError({ statusCode: 400, message: 'Missing email or code' })

  const codes = await readJsonFile(getDataPath('email-codes')) || {}
  const entry = codes[email]

  if (!entry) return { success: false, message: 'No code sent to this email' }
  if (Date.now() > entry.expires) {
    delete codes[email]
    await writeJsonFile(getDataPath('email-codes'), codes)
    return { success: false, message: 'Code expired. Please request a new one.' }
  }
  if (String(entry.code) !== String(code)) {
    return { success: false, message: 'Incorrect code' }
  }

  // Code valid — clean up
  delete codes[email]
  await writeJsonFile(getDataPath('email-codes'), codes)

  return { success: true, message: 'Email verified' }
})
