import { v4 as uuidv4 } from 'uuid'
import { readJsonFile, writeJsonFile, getDataPath, generateNewId } from '../../utils/fileUtils'
import { processImage, cleanupTempFile } from '../../utils/imageUtils'
import path from 'path'
import fs from 'fs'

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const image = formData.get('image') as File | null

  if (!title || !description || !image) {
    throw createError({ statusCode: 400, message: '缺少字段' })
  }

  // Save temp file
  const tempDir = path.join(process.cwd(), 'tmp')
  fs.mkdirSync(tempDir, { recursive: true })
  const tempFilename = `${uuidv4()}${path.extname(image.name) || '.jpg'}`
  const tempPath = path.join(tempDir, tempFilename)
  const buffer = Buffer.from(await image.arrayBuffer())
  fs.writeFileSync(tempPath, buffer)

  try {
    const baseFilename = uuidv4()
    const webpImage = await processImage(tempPath, baseFilename)
    const heroes = await readJsonFile(getDataPath('hero')) || []
    const newId = generateNewId(heroes)
    heroes.push({ id: newId, title, description, image: webpImage })
    await writeJsonFile(getDataPath('hero'), heroes)
    return { success: true, heroId: newId }
  } catch (e: any) {
    await cleanupTempFile(tempPath)
    throw createError({ statusCode: 500, message: e.message })
  }
})
