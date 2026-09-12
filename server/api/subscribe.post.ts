import { sendEmail } from '../utils/mailer'
import { getDb } from '../utils/db'

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body || {}

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, message: '请输入有效邮箱' })
  }

  // 订阅者存入 Turso（去重）。stored=true 表示这个邮箱已经安全落地。
  let stored = false
  const db = getDb()
  if (db) {
    try {
      await db.execute({
        sql: 'INSERT OR IGNORE INTO subscribers (email) VALUES (?)',
        args: [String(email)],
      })
      stored = true
    } catch (e: any) {
      console.error('Subscriber insert failed:', e.message)
    }
  }

  // 通知自己。notified=true 表示已成功推送到通知邮箱。
  let notified = false
  const toEmail = process.env.MAIL_TO || process.env.MAIL_FROM || ''
  if (toEmail) {
    notified = await sendEmail({
      to: toEmail,
      subject: 'New Subscriber — LAFA Vape',
      html: `<h3>New Subscriber</h3><p><strong>Email:</strong> ${esc(email)}</p>`,
    })
  }

  // 欢迎信失败不影响线索保存（sandbox 发件人阶段本来就发不出去），仅记录。
  sendEmail({
    to: String(email),
    subject: 'Welcome to LAFA Vape!',
    html: `<h3>Welcome to LAFA Vape!</h3><p>Thanks for subscribing! You'll receive B2B wholesale updates, sourcing insights, and new stock alerts for vape shops and small wholesalers.</p><p><strong>— LAFA Vape Team</strong></p>`,
  }).catch((e: any) => console.error('Welcome email failed:', e?.message))

  // 两条腿都断了才算失败 —— 不能让订阅界面假报成功（同 wholesale.post.ts）
  if (!stored && !notified) {
    console.error('Subscriber LOST — both DB and email failed:', email)
    throw createError({
      statusCode: 502,
      message: 'Could not subscribe. Please email sales@lafavape.com directly.',
    })
  }

  return { success: true, stored, notified }
})
