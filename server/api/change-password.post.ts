import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { currentPassword, newPassword } = body || {}

  if (!currentPassword || !newPassword) {
    throw createError({ statusCode: 400, message: '请填写当前密码和新密码' })
  }

  const hashed = process.env.PASSWORD_HASH
  if (!hashed) throw createError({ statusCode: 500, message: '未配置密码' })

  const match = await bcrypt.compare(currentPassword, hashed)
  if (!match) throw createError({ statusCode: 400, message: '当前密码错误' })

  const newHash = await bcrypt.hash(newPassword, 10)
  const envPath = path.join(process.cwd(), '.env')
  let envContent = fs.readFileSync(envPath, 'utf-8')
  envContent = envContent.replace(/PASSWORD_HASH=.*/, `PASSWORD_HASH=${newHash}`)
  fs.writeFileSync(envPath, envContent)

  return { success: true }
})
