import { v4 as uuidv4 } from 'uuid'
import { readJsonFile, writeJsonFile, getDataPath, generateNewId } from '../../utils/fileUtils'
import { processImage, cleanupTempFile } from '../../utils/imageUtils'
import path from 'path'
import fs from 'fs'

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const author = formData.get('author') as string
  const tags = formData.get('tags') as string
  const image = formData.get('image') as File | null

  if (!title || !content || !author || !tags || !image) {
    throw createError({ statusCode: 400, message: '缺少字段' })
  }

  const tempDir = path.join(process.cwd(), 'tmp')
  fs.mkdirSync(tempDir, { recursive: true })
  const tempFilename = `${uuidv4()}${path.extname(image.name) || '.jpg'}`
  const tempPath = path.join(tempDir, tempFilename)
  fs.writeFileSync(tempPath, Buffer.from(await image.arrayBuffer()))

  try {
    const baseFilename = uuidv4()
    const webpImage = await processImage(tempPath, baseFilename)
    const blogs = await readJsonFile(getDataPath('blog')) || []
    const newId = generateNewId(blogs)
    blogs.push({
      id: newId,
      title,
      content,
      image: webpImage,
      excerpt: content.slice(0, 100) + '...',
      date: new Date().toISOString().split('T')[0],
      author,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      likes: 0
    })
    await writeJsonFile(getDataPath('blog'), blogs)
    return { success: true, blogId: newId }
  } catch (e: any) {
    await cleanupTempFile(tempPath)
    throw createError({ statusCode: 500, message: e.message })
  }
})
