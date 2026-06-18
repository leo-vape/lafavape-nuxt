import { readJsonFile, writeJsonFile, getDataPath } from '../utils/fileUtils'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id } = body || {}

  if (!id) throw createError({ statusCode: 400, message: 'Missing blog id' })

  const filePath = getDataPath('blog')
  const blogs = await readJsonFile(filePath) || []

  const blog = blogs.find((b: any) => String(b.id) === String(id))
  if (!blog) throw createError({ statusCode: 404, message: 'Blog not found' })

  blog.likes = (blog.likes || 0) + 1
  await writeJsonFile(filePath, blogs)

  return { success: true, likes: blog.likes }
})
