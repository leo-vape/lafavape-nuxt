import { v4 as uuidv4 } from 'uuid'
import { readJsonFile, writeJsonFile, getDataPath, generateNewId } from '../../utils/fileUtils'
import { processImage, cleanupTempFile } from '../../utils/imageUtils'
import path from 'path'
import fs from 'fs'

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const image = formData.get('image') as File | null
  const specsJson = formData.get('specs') as string
  const priceStr = formData.get('price') as string
  const comparePriceStr = formData.get('comparePrice') as string

  if (!name || !description || !image) {
    throw createError({ statusCode: 400, message: 'Missing fields' })
  }

  let specs: { label: string; value: string }[] = []
  if (specsJson) {
    try { specs = JSON.parse(specsJson) } catch {}
  }

  const tempDir = path.join(process.cwd(), 'tmp')
  fs.mkdirSync(tempDir, { recursive: true })
  const tempFilename = `${uuidv4()}${path.extname(image.name) || '.jpg'}`
  const tempPath = path.join(tempDir, tempFilename)
  fs.writeFileSync(tempPath, Buffer.from(await image.arrayBuffer()))

  try {
    const baseFilename = uuidv4()
    const webpImage = await processImage(tempPath, baseFilename)
    const products = await readJsonFile(getDataPath('products')) || []
    const newId = generateNewId(products)
    const entry: any = { id: newId, name, description, image: webpImage, specs }
    if (priceStr) entry.price = parseFloat(priceStr)
    if (comparePriceStr) entry.comparePrice = parseFloat(comparePriceStr)
    products.push(entry)
    await writeJsonFile(getDataPath('products'), products)
    return { success: true, productId: newId }
  } catch (e: any) {
    await cleanupTempFile(tempPath)
    throw createError({ statusCode: 500, message: e.message })
  }
})
