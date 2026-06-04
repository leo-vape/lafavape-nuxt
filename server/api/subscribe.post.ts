import { subDb } from '../utils/database'
import { sendEmail } from '../utils/mailer'
import { readJsonFile, getDataPath } from '../utils/fileUtils'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body || {}

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, message: '请输入有效邮箱' })
  }

  const existing = subDb.prepare('SELECT email FROM subscribers WHERE email = ?').get(email)
  if (existing) return { success: true }

  subDb.prepare('INSERT INTO subscribers (email, subscribed_at) VALUES (?, ?)').run(email, new Date().toISOString())

  const settings = await readJsonFile(getDataPath('settings')) || {}
  const toEmail = settings.contactEmail || process.env.MAIL_TO || ''

  try {
    await Promise.all([
      sendEmail({
        to: toEmail,
        subject: '新订阅 from LAFA Vape',
        html: `<h3>新订阅通知</h3><p><strong>邮箱:</strong> ${email}</p>`
      }).catch(e => console.error('Notify email failed:', e)),
      sendEmail({
        to: email,
        subject: '欢迎订阅 LAFA Vape！',
        html: `<h3>欢迎订阅 LAFA Vape！</h3><p>感谢您加入我们！您将收到最新的动态、唐宋风味新品和独家优惠。</p><p><strong>LAFA Vape 团队</strong></p>`
      }).catch(e => console.error('Welcome email failed:', e))
    ])
  } catch (e: any) {
    console.error('Subscription email error:', e.message)
  }

  return { success: true }
})
