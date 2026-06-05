import { v4 as uuidv4 } from 'uuid'
import { processImage, cleanupTempFile } from '../../utils/imageUtils'
import { insertProduct } from '../../utils/productDb'
import path from 'path'
import fs from 'fs'

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const specsJson = formData.get('specs') as string
  const priceStr = formData.get('price') as string
  const comparePriceStr = formData.get('comparePrice') as string
  const seriesName = (formData.get('seriesName') as string) || 'Other'
  const seriesZh = (formData.get('seriesZh') as string) || '其他'
  const flavorName = (formData.get('flavorName') as string) || ''
  const flavorZh = (formData.get('flavorZh') as string) || flavorName
  const imageFiles = formData.getAll('images') as File[]

  if (!name || !flavorName) {
    throw createError({ statusCode: 400, message: '必须填写产品名称和口味名称' })
  }

  let specs: { label: string; value: string }[] = []
  if (specsJson) {
    try { specs = JSON.parse(specsJson) } catch {}
  }

  const imageUrls: string[] = []
  for (const img of imageFiles) {
    if (!img || img.size === 0) continue
    const tempDir = path.join(process.cwd(), 'tmp')
    fs.mkdirSync(tempDir, { recursive: true })
    const tempFilename = `${uuidv4()}${path.extname(img.name) || '.jpg'}`
    const tempPath = path.join(tempDir, tempFilename)
    fs.writeFileSync(tempPath, Buffer.from(await img.arrayBuffer()))
    try {
      const baseFilename = uuidv4()
      imageUrls.push(await processImage(tempPath, baseFilename))
    } catch (e: any) {
      await cleanupTempFile(tempPath)
      throw createError({ statusCode: 500, message: e.message })
    }
  }

  const newId = insertProduct({
    name,
    description,
    image: imageUrls[0] || '',
    images: imageUrls,
    price: priceStr ? parseFloat(priceStr) : undefined,
    comparePrice: comparePriceStr ? parseFloat(comparePriceStr) : undefined,
    specs,
    series: [{ name: seriesName, zh: seriesZh, flavors: [{ name: flavorName, zh: flavorZh, image: imageUrls[0] || '', desc: (description || '').slice(0, 100) }] }]
  })

  return { success: true, productId: newId }
})
