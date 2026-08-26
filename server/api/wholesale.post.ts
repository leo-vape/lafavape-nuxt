import { sendEmail } from '../utils/mailer'
import { getDb } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { company, country, contact, interest, quantity } = body || {}

  if (!company || !contact) {
    throw createError({ statusCode: 400, message: 'Please provide company and contact' })
  }

  // 批发询盘存入 Turso
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
    } catch (e: any) {
      console.error('Wholesale insert failed:', e.message)
    }
  }

  // 邮件通知
  const toEmail = process.env.MAIL_TO || process.env.MAIL_FROM || ''
  if (toEmail) {
    try {
      await sendEmail({
        to: toEmail,
        subject: 'New Wholesale Inquiry — LAFA Vape',
        html: `<h3>新批发询盘</h3>
          <p><strong>公司/店名:</strong> ${company}</p>
          <p><strong>国家:</strong> ${country || '-'}</p>
          <p><strong>联系方式:</strong> ${contact}</p>
          <p><strong>采购意向:</strong> ${interest || '-'}</p>
          <p><strong>预计量:</strong> ${quantity || '-'}</p>`,
      })
    } catch (e: any) {
      console.error('Wholesale email failed:', e.message)
    }
  }

  return { success: true }
})
