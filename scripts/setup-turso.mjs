// 初始化 Turso 数据库表结构（可重复运行，幂等）
import { createClient } from '@libsql/client/web'

const url = process.env.TURSO_DATABASE_URL || process.env.TURSO_URL
const authToken = process.env.TURSO_AUTH_TOKEN || process.env.TURSO_TOKEN

if (!url || !authToken) {
  console.error('❌ 缺少环境变量：TURSO_DATABASE_URL 和 TURSO_AUTH_TOKEN')
  process.exit(1)
}

const db = createClient({ url, authToken })

const statements = [
  `CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS code_queries (
    code TEXT PRIMARY KEY,
    query_count INTEGER NOT NULL DEFAULT 0,
    last_queried_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS referrers (
    ref_id TEXT PRIMARY KEY,
    visits INTEGER NOT NULL DEFAULT 0,
    shares INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS reward_claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    tier INTEGER NOT NULL,
    title TEXT,
    contact TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS blog_likes (
    blog_id TEXT PRIMARY KEY,
    likes INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`
]

for (const sql of statements) {
  await db.execute(sql)
}

const tables = await db.execute(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`)
console.log('✅ 建表完成，当前表：')
for (const row of tables.rows) console.log('  -', row.name)
