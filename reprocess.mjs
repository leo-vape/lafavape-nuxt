import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, 'public', 'uploads')

const files = fs.readdirSync(uploadsDir).filter(f =>
  f.endsWith('.webp') && !f.includes('_small') && !f.includes('placeholder_')
)

console.log(`Found ${files.length} images to reprocess\n`)

for (const file of files) {
  const baseFilename = file.replace('.webp', '')
  const mainPath = path.join(uploadsDir, file)
  const smallPath = path.join(uploadsDir, `${baseFilename}_small.webp`)
  const placeholderPath = path.join(uploadsDir, `placeholder_${baseFilename}.jpg`)

  try {
    const meta = await sharp(mainPath).metadata()
    await sharp(mainPath)
      .resize({ width: 1200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 90 })
      .toFile(smallPath)
    await sharp(mainPath)
      .resize({ width: 300, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 40 })
      .toFile(placeholderPath)
    console.log(`  ✅ ${file} (${meta.width}x${meta.height})`)
  } catch (err) {
    console.error(`  ❌ ${file}: ${err.message}`)
  }
}

console.log(`\nDone — ${files.length} images reprocessed.`)
