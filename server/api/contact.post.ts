import { sendEmail } from '../utils/mailer'
import { getDb } from '../utils/db'

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, message } = body || {}

  if (!name || !email || !message) {
    throw createError({ statusCode: 400, message: '请填写所有字段' })
  }

  // 留言存入 Turso。stored=true 表示这条留言已经安全落地。
  let stored = false
  const db = getDb()
  if (db) {
    try {
      await db.execute({
        sql: 'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
        args: [String(name), String(email), String(message)],
      })
      stored = true
    } catch (e: any) {
      console.error('Contact insert failed:', e.message)
    }
  }

  // 邮件通知。notified=true 表示已成功推送到通知邮箱。
  let notified = false
  const toEmail = process.env.MAIL_TO || process.env.MAIL_FROM || ''
  if (toEmail) {
    notified = await sendEmail({
      to: toEmail,
      subject: `新留言 from ${esc(name)}`,
      html: `<h3>新留言通知</h3>
        <p><strong>姓名:</strong> ${esc(name)}</p>
        <p><strong>邮箱:</strong> ${esc(email)}</p>
        <p><strong>留言:</strong> ${esc(message)}</p>
        <p>-- LAFA Vape 团队</p>`,
    })
  }

  // 两条腿都断了才算失败 —— 绝不能让表单假报成功（同 wholesale.post.ts）
  if (!stored && !notified) {
    console.error('Contact message LOST — both DB and email failed:', { name, email })
    throw createError({
      statusCode: 502,
      message: 'Could not submit. Please email sales@lafavape.com directly.',
    })
  }

  return { success: true, stored, notified }
})
