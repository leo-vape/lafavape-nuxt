import { sendEmail } from '../utils/mailer'
import { getDb } from '../utils/db'

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { company, country, contact, interest, quantity } = body || {}

  if (!company || !contact) {
    throw createError({ statusCode: 400, message: 'Please provide company and contact' })
  }

  // 批发询盘存入 Turso。stored=true 表示这条线索已经安全落地。
  let stored = false
  const db = getDb()
  if (db) {
    try {
      await db.execute({
        sql: `INSERT INTO wholesale_inquiries (company, country, contact, interest, quantity)
              VALUES (?, ?, ?, ?, ?)`,
        args: [
          String(company),
          String(country || ''),
          String(contact),
          String(interest || ''),
          String(quantity || ''),
        ],
      })
      stored = true
    } catch (e: any) {
      console.error('Wholesale insert failed:', e.message)
    }
  }

  // 邮件通知。notified=true 表示已成功推送到通知邮箱。
  let notified = false
  const toEmail = process.env.MAIL_TO || process.env.MAIL_FROM || ''
  if (toEmail) {
    notified = await sendEmail({
      to: toEmail,
      subject: `New Wholesale Inquiry — ${esc(company)}`,
      html: `<h3>新批发询盘</h3>
        <p><strong>公司/店名:</strong> ${esc(company)}</p>
        <p><strong>国家:</strong> ${esc(country) || '-'}</p>
        <p><strong>联系方式:</strong> ${esc(contact)}</p>
        <p><strong>采购意向:</strong> ${esc(interest) || '-'}</p>
        <p><strong>预计量:</strong> ${esc(quantity) || '-'}</p>`,
    })
  }

  // 两条腿都断了才算失败：只要有一条记下了，这条线索就没丢。
  // 此时如实报错，并把 sales@ 直接告诉客户 —— 绝不能让表单假报成功。
  if (!stored && !notified) {
    console.error('Wholesale inquiry LOST — both DB and email failed:', { company, contact })
    throw createError({
      statusCode: 502,
      message: 'Could not submit. Please email sales@lafavape.com directly.',
    })
  }

  return { success: true, stored, notified }
})
