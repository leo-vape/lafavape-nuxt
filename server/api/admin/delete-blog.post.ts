import { readJsonFile, writeJsonFile, getDataPath } from '../../utils/fileUtils'
import { deleteImages } from '../../utils/imageUtils'
import path from 'path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id } = body || {}
  if (!id) throw createError({ statusCode: 400, message: '博客 ID 缺失' })

  const blogs = await readJsonFile(getDataPath('blog'))
  const index = blogs.findIndex((b: any) => String(b.id) === String(id))
  if (index === -1) throw createError({ statusCode: 404, message: '博客不存在' })

  await deleteImages(blogs[index].image, path.join(process.cwd(), 'public', 'uploads'))
  blogs.splice(index, 1)
  await writeJsonFile(getDataPath('blog'), blogs)

  return { success: true }
})
