import { readJsonFile, getDataPath } from '../../utils/fileUtils'

// Static imports for build-time bundling
import productsData from '../../data/products.json'
import blogData from '../../data/blog.json'
import heroData from '../../data/hero.json'
import settingsData from '../../data/settings.json'
import codesData from '../../data/codes.json'

const staticData: Record<string, any> = {
  products: productsData,
  blog: blogData,
  hero: heroData,
  settings: settingsData,
  codes: codesData,
}

export default defineEventHandler(async (event) => {
  const file = getRouterParam(event, 'file')
  if (!file) throw createError({ statusCode: 400, message: 'Missing file parameter' })

  // Static import (works on Vercel serverless)
  if (staticData[file]) return staticData[file]

  // Fallback: file system (for prerender / local dev)
  const filePath = getDataPath(file)
  const data = await readJsonFile(filePath)
  if (data === null) throw createError({ statusCode: 404, message: 'File not found' })
  return data
})
