import { Resend } from 'resend'

/**
 * Returns true only when Resend actually accepted the message.
 * Callers must use this to decide whether a lead was safely captured —
 * never swallow a delivery failure silently (see wholesale.post.ts).
 */
export async function sendEmail(opts: { to: string; subject: string; html: string; text?: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('Email not sent: RESEND_API_KEY not configured')
    return false
  }

  const resend = new Resend(apiKey)
  const from = process.env.MAIL_FROM || 'LAFA Vape <info@lafavape.com>'

  try {
    const { error } = await resend.emails.send({ from, ...opts })
    if (error) {
      console.error('Resend error:', error.message)
      return false
    }
    console.log('Email sent via Resend')
    return true
  } catch (e: any) {
    console.error('Resend failed:', e.message)
    return false
  }
}

