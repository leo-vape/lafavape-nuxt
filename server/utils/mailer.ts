import { Resend } from 'resend'

export async function sendEmail(opts: { to: string; subject: string; html: string; text?: string }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log('Email not sent: RESEND_API_KEY not configured')
    return
  }

  const resend = new Resend(apiKey)
  const from = process.env.MAIL_FROM || 'LAFA Vape <info@lafavape.com>'

  try {
    const { error } = await resend.emails.send({ from, ...opts })
    if (error) {
      console.error('Resend error:', error.message)
    } else {
      console.log('Email sent via Resend')
    }
  } catch (e: any) {
    console.error('Resend failed:', e.message)
  }
}

