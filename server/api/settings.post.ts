import { writeJsonFile, getDataPath } from '../utils/fileUtils'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body || Object.keys(body).length === 0) {
    throw createError({ statusCode: 400, message: '设置内容不能为空' })
  }
  await writeJsonFile(getDataPath('settings'), body)
  return { success: true }
})
