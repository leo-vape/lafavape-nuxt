import { deleteImages, getUploadsDir } from '../../utils/imageUtils'
import { getProductById, deleteProduct } from '../../utils/productDb'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id } = body || {}
  if (!id) throw createError({ statusCode: 400, message: '产品 ID 缺失' })

  const product = getProductById(Number(id))
  if (!product) throw createError({ statusCode: 404, message: '产品不存在' })

  if (product.image) await deleteImages(product.image, getUploadsDir())
  deleteProduct(Number(id))

  return { success: true }
})
