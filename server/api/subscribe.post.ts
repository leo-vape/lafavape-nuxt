import { sendEmail } from '../utils/mailer'
import { getDb } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body || {}

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, message: '请输入有效邮箱' })
  }

  // 订阅者存入 Turso（去重）
  const db = getDb()
  if (db) {
    try {
      await db.execute({
        sql: 'INSERT OR IGNORE INTO subscribers (email) VALUES (?)',
        args: [String(email)]
      })
    } catch (e: any) {
      console.error('Subscriber insert failed:', e.message)
    }
  }

  const toEmail = process.env.MAIL_TO || process.env.MAIL_FROM || ''
  try {
    await Promise.all([
      toEmail
        ? sendEmail({
            to: toEmail,
            subject: 'New Subscriber — LAFA Vape',
            html: `<h3>New Subscriber</h3><p><strong>Email:</strong> ${email}</p>`
          }).catch(e => console.error('Notify email failed:', e))
        : Promise.resolve(),
      sendEmail({
        to: String(email),
        subject: 'Welcome to LAFA Vape!',
        html: `<h3>Welcome to LAFA Vape!</h3><p>Thanks for subscribing! You'll receive updates on new Tang-Song flavors, exclusive offers, and more.</p><p><strong>— LAFA Vape Team</strong></p>`
      }).catch(e => console.error('Welcome email failed:', e))
    ])
  } catch (e: any) {
    console.error('Subscription email error:', e.message)
  }

  return { success: true }
})
