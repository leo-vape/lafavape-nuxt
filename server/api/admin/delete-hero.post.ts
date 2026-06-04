import { readJsonFile, writeJsonFile, getDataPath } from '../../utils/fileUtils'
import { deleteImages } from '../../utils/imageUtils'
import path from 'path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id } = body || {}
  if (!id) throw createError({ statusCode: 400, message: '英雄 ID 缺失' })

  const heroes = await readJsonFile(getDataPath('hero'))
  const index = heroes.findIndex((h: any) => String(h.id) === String(id))
  if (index === -1) throw createError({ statusCode: 404, message: '英雄不存在' })

  await deleteImages(heroes[index].image, path.join(process.cwd(), 'public', 'uploads'))
  heroes.splice(index, 1)
  await writeJsonFile(getDataPath('hero'), heroes)

  return { success: true }
})
