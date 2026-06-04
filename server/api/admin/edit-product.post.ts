import { v4 as uuidv4 } from 'uuid'
import { readJsonFile, writeJsonFile, getDataPath } from '../../utils/fileUtils'
import { processImage, deleteImages, cleanupTempFile, getUploadsDir } from '../../utils/imageUtils'
import path from 'path'
import fs from 'fs'

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const image = formData.get('image') as File | null
  const specsJson = formData.get('specs') as string
  const priceStr = formData.get('price') as string
  const comparePriceStr = formData.get('comparePrice') as string

  if (!id || !name || !description) {
    throw createError({ statusCode: 400, message: 'Missing fields' })
  }

  let specs: { label: string; value: string }[] = []
  if (specsJson) {
    try { specs = JSON.parse(specsJson) } catch {}
  }

  const products = await readJsonFile(getDataPath('products')) || []
  const index = products.findIndex((p: any) => String(p.id) === String(id))
  if (index === -1) throw createError({ statusCode: 404, message: 'Not found' })

  products[index].name = name
  products[index].description = description
  if (specs.length > 0) products[index].specs = specs

  // Price fields
  if (priceStr) products[index].price = parseFloat(priceStr)
  else if (priceStr === '') delete products[index].price
  if (comparePriceStr) products[index].comparePrice = parseFloat(comparePriceStr)
  else if (comparePriceStr === '') delete products[index].comparePrice

  const reviewsJson = formData.get('reviews') as string
  if (reviewsJson) {
    try { products[index].reviews = JSON.parse(reviewsJson) } catch {}
  }

  if (image && image.size > 0) {
    const tempDir = path.join(process.cwd(), 'tmp')
    fs.mkdirSync(tempDir, { recursive: true })
    const tempFilename = `${uuidv4()}${path.extname(image.name) || '.jpg'}`
    const tempPath = path.join(tempDir, tempFilename)
    fs.writeFileSync(tempPath, Buffer.from(await image.arrayBuffer()))

    try {
      await deleteImages(products[index].image, getUploadsDir())
      const baseFilename = uuidv4()
      const webpImage = await processImage(tempPath, baseFilename)
      products[index].image = webpImage
    } catch (e: any) {
      await cleanupTempFile(tempPath)
      throw createError({ statusCode: 500, message: e.message })
    }
  }

  await writeJsonFile(getDataPath('products'), products)
  return { success: true }
})
