import fs from 'fs'
import path from 'path'
import { subDb } from '../../utils/database'

export default defineEventHandler(() => {
  // Read contacts.txt
  const contactsPath = path.join(process.cwd(), 'server/data/contacts.txt')
  let contacts: any[] = []
  try {
    const raw = fs.readFileSync(contactsPath, 'utf-8')
    contacts = raw.split('\n').filter(Boolean).map(line => {
      try { return JSON.parse(line) } catch { return null }
    }).filter(Boolean).reverse().slice(0, 20)
  } catch {}

  // Read subscribers
  const subscribers = subDb.prepare('SELECT * FROM subscribers ORDER BY subscribed_at DESC LIMIT 20').all()

  return { contacts, subscribers }
})
