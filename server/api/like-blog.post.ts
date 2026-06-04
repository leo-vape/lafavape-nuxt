import { readJsonFile, writeJsonFile, getDataPath } from '../utils/fileUtils'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id } = body || {}

  if (!id) throw createError({ statusCode: 400, message: '博客 ID 缺失' })

  const filePath = getDataPath('blog')
  const blogs = await readJsonFile(filePath)
  if (!blogs) throw createError({ statusCode: 404, message: 'Blog file not found' })

  const blog = blogs.find((b: any) => String(b.id) === String(id))
  if (!blog) throw createError({ statusCode: 404, message: '博客不存在' })

  blog.likes = (blog.likes || 0) + 1
  await writeJsonFile(filePath, blogs)

  return { success: true, likes: blog.likes }
})
