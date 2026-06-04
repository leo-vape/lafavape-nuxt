import { readFormData } from 'h3'
import { parse } from 'csv-parse/sync'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import { readJsonFile, writeJsonFile, getDataPath, generateNewId } from '../../utils/fileUtils'
import { processImage, cleanupTempFile } from '../../utils/imageUtils'

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)
  const file = formData.get('file') as File | null
  const defaultImage = formData.get('defaultImage') as File | null
  if (!file || !file.name.endsWith('.csv')) {
    throw createError({ statusCode: 400, message: '请上传CSV文件' })
  }

  // Process default image if provided
  let defaultImageUrl = ''
  if (defaultImage && defaultImage.size > 0) {
    const tempDir = path.join(process.cwd(), 'tmp')
    fs.mkdirSync(tempDir, { recursive: true })
    const tempFilename = `${uuidv4()}${path.extname(defaultImage.name) || '.jpg'}`
    const tempPath = path.join(tempDir, tempFilename)
    fs.writeFileSync(tempPath, Buffer.from(await defaultImage.arrayBuffer()))
    try {
      const baseFilename = uuidv4()
      defaultImageUrl = await processImage(tempPath, baseFilename)
    } catch {
      await cleanupTempFile(tempPath)
    }
  }

  const text = await file.text()
  let rows: any[]
  try {
    rows = parse(text, { columns: true, skip_empty_lines: true, trim: true })
  } catch {
    throw createError({ statusCode: 400, message: 'CSV格式错误' })
  }

  const products = await readJsonFile(getDataPath('products')) || []
  let count = 0

  for (const row of rows) {
    // Helper: find column by prefix match (for annotated headers like "price($)")
    const get = (...keys: string[]) => {
      for (const k of keys) {
        if (row[k] != null && row[k] !== '') return String(row[k]).trim()
      }
      // Try prefix match with "(" for annotated headers
      for (const rk of Object.keys(row)) {
        for (const k of keys) {
          if (rk.startsWith(k) && row[rk] != null && row[rk] !== '') return String(row[rk]).trim()
        }
      }
      return ''
    }
    const name = get('name')
    const flavorName = get('flavorName', 'flavor_en')
    const flavorZh = get('flavorZh', 'flavor_cn') || flavorName
    if (!name || !flavorName) continue

    const seriesName = get('categoryName', 'seriesName', 'series') || 'Other'
    const seriesZh = get('categoryZh', 'seriesZh', 'series_cn') || '其他'

    const specs: { label: string; value: string }[] = []
    const puffs = get('puffs')
    const nicotine = get('nicotine')
    const battery = get('battery')
    const pod = get('pod')
    const charging = get('charging')
    if (puffs) specs.push({ label: 'Puffs', value: puffs.includes('Puffs') ? puffs : puffs + ' Puffs' })
    if (nicotine) specs.push({ label: 'Nicotine', value: nicotine.includes('%') ? nicotine : nicotine + '%' })
    if (battery) specs.push({ label: 'Battery', value: battery.includes('mAh') ? battery : battery + 'mAh' })
    if (pod) specs.push({ label: 'Pod', value: pod.includes('ml') ? pod : pod + 'ml' })
    if (charging) specs.push({ label: 'Charging', value: charging })

    const newId = generateNewId(products)
    const entry: any = {
      id: newId,
      name,
      description: get('description') || '',
      image: defaultImageUrl || '',
      specs,
      series: [{
        name: seriesName,
        zh: seriesZh,
        flavors: [{ name: flavorName, zh: flavorZh, image: defaultImageUrl || '', desc: '' }]
      }]
    }
    const priceVal = get('price')
    const compareVal = get('comparePrice')
    if (priceVal) entry.price = parseFloat(priceVal)
    if (compareVal) entry.comparePrice = parseFloat(compareVal)

    products.push(entry)
    count++
  }

  await writeJsonFile(getDataPath('products'), products)
  return { success: true, count }
})
