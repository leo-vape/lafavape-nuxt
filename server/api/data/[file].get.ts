import { readJsonFile, getDataPath } from '../../utils/fileUtils'

// Static imports for build-time bundling
import productsData from '../../data/products.json'
import blogData from '../../data/blog.json'
import heroData from '../../data/hero.json'
import settingsData from '../../data/settings.json'

const staticData: Record<string, any> = {
  products: productsData,
  blog: blogData,
  hero: heroData,
  settings: settingsData,
}

// 本站是 B2B 批发询价站：产品卡不公开零售价/划线价。
// 保留 JSON 里的 price 仅供内部参考，公开 API 一律剥离，避免把批发站
// 暴露成 C 端零售站（详见 01_项目总概览 定位）。
function toPublicProduct(p: any) {
  const { price, comparePrice, ...publicFields } = p || {}
  return publicFields
}

export default defineEventHandler(async (event) => {
  const file = getRouterParam(event, 'file')
  if (!file) throw createError({ statusCode: 400, message: 'Missing file parameter' })

  // 对产品列表剥离内部价格字段
  if (file === 'products') {
    return (staticData.products as any[]).map(toPublicProduct)
  }

  // Static import (works on Vercel serverless)
  if (staticData[file] !== undefined) return staticData[file]

  // Fallback: file system (for prerender / local dev)
  const filePath = getDataPath(file)
  const data = await readJsonFile(filePath)
  if (data === null) throw createError({ statusCode: 404, message: 'File not found' })
  return data
})
