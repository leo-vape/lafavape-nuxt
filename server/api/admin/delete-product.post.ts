import { readJsonFile, writeJsonFile, getDataPath } from '../../utils/fileUtils'
import { deleteImages, getUploadsDir } from '../../utils/imageUtils'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id } = body || {}
  if (!id) throw createError({ statusCode: 400, message: '产品 ID 缺失' })

  const products = await readJsonFile(getDataPath('products'))
  const index = products.findIndex((p: any) => String(p.id) === String(id))
  if (index === -1) throw createError({ statusCode: 404, message: '产品不存在' })

  await deleteImages(products[index].image, getUploadsDir())
  products.splice(index, 1)
  await writeJsonFile(getDataPath('products'), products)

  return { success: true }
})
