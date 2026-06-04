import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { password } = body || {}

  if (!password) throw createError({ statusCode: 400, message: '请输入密码' })

  const hashedPassword = process.env.PASSWORD_HASH
  if (!hashedPassword) throw createError({ statusCode: 500, message: '未配置密码哈希' })

  const match = await bcrypt.compare(password, hashedPassword)
  return { success: match }
})
