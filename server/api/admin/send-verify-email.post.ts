import { readJsonFile, writeJsonFile, getDataPath } from '../../utils/fileUtils'
import { sendEmail } from '../../utils/mailer'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body || {}

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, message: '邮箱格式不正确' })
  }

  const code = String(Math.floor(100000 + Math.random() * 900000))

  // Store code (10min expiry)
  const codes = await readJsonFile(getDataPath('email-codes')) || {}
  codes[email] = { code, expires: Date.now() + 10 * 60 * 1000 }
  await writeJsonFile(getDataPath('email-codes'), codes)

  // Send email
  try {
    await sendEmail({
      to: email,
      subject: 'LAFA 后台验证码 / Admin Verification Code',
      html: `<div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:20px">
        <h2 style="color:#b8941f">LAFA Vape</h2>
        <p>您的验证码为：</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px;color:#000;background:#f5f5f7;padding:12px 24px;border-radius:8px;text-align:center;margin:16px 0">${code}</p>
        <p style="color:#666;font-size:13px">10 分钟内有效。如非本人操作请忽略。</p>
      </div>`,
    })
    return { success: true, code, sent: true }
  } catch {
    // Email failed, still return code so admin can see it on page
    return { success: true, code, sent: false }
  }
})

