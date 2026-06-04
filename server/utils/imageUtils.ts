import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

export async function processImage(inputPath: string, baseFilename: string): Promise<string> {
  const webpPath = path.join(uploadsDir, `${baseFilename}.webp`)
  const smallWebpPath = path.join(uploadsDir, `${baseFilename}_small.webp`)
  const placeholderPath = path.join(uploadsDir, `placeholder_${baseFilename}.jpg`)
  const originalPath = path.join(uploadsDir, `${baseFilename}_orig.webp`)

  // Get original metadata to preserve quality
  const metadata = await sharp(inputPath).metadata()

  await Promise.all([
    // Full quality WebP — no resize, near-lossless
    sharp(inputPath)
      .webp({ quality: 95, effort: 6 })
      .toFile(webpPath),
    // Small responsive version — 1200px for Retina
    sharp(inputPath)
      .resize({ width: 1200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 90 })
      .toFile(smallWebpPath),
    // Placeholder — 300px blur-up
    sharp(inputPath)
      .resize({ width: 300, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 40 })
      .toFile(placeholderPath),
  ])

  // Clean up original if not webp
  if (!inputPath.endsWith('.webp')) {
    try { fs.unlinkSync(inputPath) } catch {}
  }

  return `/uploads/${baseFilename}.webp`
}

export async function cleanupTempFile(filePath: string): Promise<void> {
  if (!filePath) return
  try { fs.unlinkSync(filePath) } catch {}
}

export async function deleteImages(imagePath: string, uploadsDirPath: string): Promise<void> {
  if (!imagePath) return
  const filename = path.basename(imagePath) // e.g. abc123.webp
  const base = filename.replace(/\.(webp|jpg|png|gif)$/, '')
  const patterns = [
    `${base}.webp`,
    `${base}_small.webp`,
    `placeholder_${base}.jpg`
  ]
  patterns.forEach(p => {
    const fp = path.join(uploadsDirPath, p)
    try { if (fs.existsSync(fp)) fs.unlinkSync(fp) } catch {}
  })
}
