import { v4 as uuidv4 } from 'uuid'
import { readJsonFile, writeJsonFile, getDataPath } from '../../utils/fileUtils'
import { processImage, deleteImages, cleanupTempFile, getUploadsDir } from '../../utils/imageUtils'
import path from 'path'
import fs from 'fs'

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const image = formData.get('image') as File | null

  if (!id || !title || !description) {
    throw createError({ statusCode: 400, message: 'Missing fields' })
  }

  const heroes = await readJsonFile(getDataPath('hero')) || []
  const index = heroes.findIndex((h: any) => String(h.id) === String(id))
  if (index === -1) throw createError({ statusCode: 404, message: 'Not found' })

  heroes[index].title = title
  heroes[index].description = description

  // Update image if provided
  if (image && image.size > 0) {
    const tempDir = path.join(process.cwd(), 'tmp')
    fs.mkdirSync(tempDir, { recursive: true })
    const tempFilename = `${uuidv4()}${path.extname(image.name) || '.jpg'}`
    const tempPath = path.join(tempDir, tempFilename)
    fs.writeFileSync(tempPath, Buffer.from(await image.arrayBuffer()))

    try {
      // Delete old images
      await deleteImages(heroes[index].image, getUploadsDir())
      const baseFilename = uuidv4()
      const webpImage = await processImage(tempPath, baseFilename)
      heroes[index].image = webpImage
    } catch (e: any) {
      await cleanupTempFile(tempPath)
      throw createError({ statusCode: 500, message: e.message })
    }
  }

  await writeJsonFile(getDataPath('hero'), heroes)
  return { success: true }
})
