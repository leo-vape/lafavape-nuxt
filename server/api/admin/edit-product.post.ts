import { v4 as uuidv4 } from 'uuid'
import { getProductById, updateProduct } from '../../utils/productDb'
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

  if (!id || !name) {
    throw createError({ statusCode: 400, message: 'Missing fields' })
  }

  const numId = Number(id)
  const existing = getProductById(numId)
  if (!existing) throw createError({ statusCode: 404, message: 'Not found' })

  const updates: any = { name }
  if (description !== null && description !== undefined) updates.description = description

  let specs: { label: string; value: string }[] = []
  if (specsJson) {
    try { specs = JSON.parse(specsJson) } catch {}
  }
  if (specs.length > 0) updates.specs = specs

  if (priceStr) updates.price = parseFloat(priceStr)
  if (comparePriceStr) updates.comparePrice = parseFloat(comparePriceStr)

  if (image && image.size > 0) {
    const tempDir = path.join(process.cwd(), 'tmp')
    fs.mkdirSync(tempDir, { recursive: true })
    const tempFilename = `${uuidv4()}${path.extname(image.name) || '.jpg'}`
    const tempPath = path.join(tempDir, tempFilename)
    fs.writeFileSync(tempPath, Buffer.from(await image.arrayBuffer()))
    try {
      if (existing.image) await deleteImages(existing.image, getUploadsDir())
      const baseFilename = uuidv4()
      updates.image = await processImage(tempPath, baseFilename)
    } catch (e: any) {
      await cleanupTempFile(tempPath)
      throw createError({ statusCode: 500, message: e.message })
    }
  }

  updateProduct(numId, updates)
  return { success: true }
})
