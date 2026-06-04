import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dataDir = path.join(process.cwd(), 'server/data')
fs.mkdirSync(dataDir, { recursive: true })

const subDbFile = path.join(dataDir, 'subscribers.db')
const codeDbFile = path.join(dataDir, 'codes.db')

// ── Subscribers DB ──
const subDb = new Database(subDbFile)
subDb.pragma('journal_mode = WAL')
subDb.exec(`
  CREATE TABLE IF NOT EXISTS subscribers (
    email TEXT PRIMARY KEY,
    subscribed_at TEXT
  )
`)

// ── Codes DB ──
const codeDb = new Database(codeDbFile)
codeDb.pragma('journal_mode = WAL')
codeDb.exec(`
  CREATE TABLE IF NOT EXISTS codes (
    code TEXT PRIMARY KEY,
    flavor TEXT,
    date TEXT,
    query_count INTEGER DEFAULT 0
  )
`)

export { subDb, codeDb }
