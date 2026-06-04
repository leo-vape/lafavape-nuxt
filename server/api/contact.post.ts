import fs from 'fs'
import path from 'path'
import { sendEmail } from '../utils/mailer'
import { readJsonFile, getDataPath } from '../utils/fileUtils'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, message } = body || {}

  if (!name || !email || !message) {
    throw createError({ statusCode: 400, message: '请填写所有字段' })
  }

  const contactsPath = path.join(process.cwd(), 'server/data/contacts.txt')
  fs.appendFileSync(contactsPath, `${JSON.stringify(body)}\n`)

  const settings = await readJsonFile(getDataPath('settings')) || {}
  const toEmail = settings.contactEmail || process.env.MAIL_TO || ''

  try {
    await sendEmail({
      to: toEmail,
      subject: '新留言 from LAFA Vape',
      html: `<h3>新留言通知</h3><p><strong>姓名:</strong> ${name}</p><p><strong>邮箱:</strong> ${email}</p><p><strong>留言:</strong> ${message}</p><p>-- LAFA Vape 团队</p>`
    })
  } catch (e: any) {
    console.error('Contact email failed:', e.message)
  }

  return { success: true }
})
