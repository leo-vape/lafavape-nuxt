import { sendEmail } from '../utils/mailer'
import { getDb } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, message } = body || {}

  if (!name || !email || !message) {
    throw createError({ statusCode: 400, message: '请填写所有字段' })
  }

  // 留言存入 Turso
  const db = getDb()
  if (db) {
    try {
      await db.execute({
        sql: 'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
        args: [String(name), String(email), String(message)]
      })
    } catch (e: any) {
      console.error('Contact insert failed:', e.message)
    }
  }

  // 邮件通知
  const toEmail = process.env.MAIL_TO || process.env.MAIL_FROM || ''
  if (toEmail) {
    try {
      await sendEmail({
        to: toEmail,
        subject: '新留言 from LAFA Vape',
        html: `<h3>新留言通知</h3><p><strong>姓名:</strong> ${name}</p><p><strong>邮箱:</strong> ${email}</p><p><strong>留言:</strong> ${message}</p><p>-- LAFA Vape 团队</p>`
      })
    } catch (e: any) {
      console.error('Contact email failed:', e.message)
    }
  }

  return { success: true }
})
