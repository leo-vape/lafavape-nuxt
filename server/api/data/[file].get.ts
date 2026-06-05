import { readJsonFile, getDataPath } from '../../utils/fileUtils'
import { getAllProducts } from '../../utils/productDb'

export default defineEventHandler(async (event) => {
  const file = getRouterParam(event, 'file')
  if (!file) throw createError({ statusCode: 400, message: 'Missing file parameter' })

  // Products are now stored in SQLite
  if (file === 'products') return getAllProducts()

  const filePath = getDataPath(file)
  const data = await readJsonFile(filePath)
  if (data === null) throw createError({ statusCode: 404, message: 'File not found' })
  return data
})
