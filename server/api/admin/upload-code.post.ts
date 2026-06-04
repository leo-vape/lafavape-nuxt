import { codeDb } from '../../utils/database'
import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)
  const file = formData.get('file') as File | null

  if (!file) {
    throw createError({ statusCode: 400, message: '请上传 CSV 文件' })
  }

  const uploadDate = new Date().toISOString().split('T')[0]
  const tempDir = path.join(process.cwd(), 'tmp')
  fs.mkdirSync(tempDir, { recursive: true })
  const tempPath = path.join(tempDir, `temp_codes_${Date.now()}.csv`)
  fs.writeFileSync(tempPath, Buffer.from(await file.arrayBuffer()))

  let insertedCount = 0
  let skippedCount = 0

  try {
    const csvData = fs.readFileSync(tempPath, 'utf-8')
    const records = parse(csvData, { columns: true, trim: true, skip_empty_lines: true })

    const insert = codeDb.prepare('INSERT OR IGNORE INTO codes (code, flavor, date, query_count) VALUES (?, ?, ?, 0)')
    const transaction = codeDb.transaction((rows: any[]) => {
      for (const row of rows) {
        if (row.code && row.flavor && row.date) {
          const result = insert.run(row.code, row.flavor, row.date)
          insertedCount += result.changes
          skippedCount += result.changes ? 0 : 1
        } else {
          skippedCount++
        }
      }
    })

    transaction(records)
  } catch (e: any) {
    console.error('CSV parse error:', e.message)
  } finally {
    try { fs.unlinkSync(tempPath) } catch {}
  }

  return { success: true, inserted: insertedCount, skipped: skippedCount, upload_date: uploadDate }
})
