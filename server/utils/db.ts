import { createClient, type Client } from '@libsql/client/web'

let _client: Client | null = null

// 从环境变量读取 Turso 连接信息，返回共享的数据库客户端
export function getDb(): Client | null {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  if (!url || !authToken) return null
  if (!_client) {
    _client = createClient({ url, authToken })
  }
  return _client
}
