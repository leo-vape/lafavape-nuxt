import { v4 as uuidv4 } from 'uuid'
import { readJsonFile, writeJsonFile, getDataPath } from '../../utils/fileUtils'
import { processImage, deleteImages, cleanupTempFile, getUploadsDir } from '../../utils/imageUtils'
import path from 'path'
import fs from 'fs'

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const author = formData.get('author') as string
  const tags = formData.get('tags') as string
  const image = formData.get('image') as File | null

  if (!id || !title || !content || !author || !tags) {
    throw createError({ statusCode: 400, message: 'Missing fields' })
  }

  const blogs = await readJsonFile(getDataPath('blog')) || []
  const index = blogs.findIndex((b: any) => String(b.id) === String(id))
  if (index === -1) throw createError({ statusCode: 404, message: 'Not found' })

  blogs[index].title = title
  blogs[index].content = content
  blogs[index].excerpt = content.slice(0, 100) + '...'
  blogs[index].author = author
  blogs[index].tags = tags.split(',').map(t => t.trim()).filter(t => t)

  if (image && image.size > 0) {
    const tempDir = path.join(process.cwd(), 'tmp')
    fs.mkdirSync(tempDir, { recursive: true })
    const tempFilename = `${uuidv4()}${path.extname(image.name) || '.jpg'}`
    const tempPath = path.join(tempDir, tempFilename)
    fs.writeFileSync(tempPath, Buffer.from(await image.arrayBuffer()))

    try {
      await deleteImages(blogs[index].image, getUploadsDir())
      const baseFilename = uuidv4()
      const webpImage = await processImage(tempPath, baseFilename)
      blogs[index].image = webpImage
    } catch (e: any) {
      await cleanupTempFile(tempPath)
      throw createError({ statusCode: 500, message: e.message })
    }
  }

  await writeJsonFile(getDataPath('blog'), blogs)
  return { success: true }
})
