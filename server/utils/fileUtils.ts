import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'server/data')
fs.mkdirSync(dataDir, { recursive: true })

export function readJsonFile(filePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') return resolve(null)
        return reject(err)
      }
      try {
        resolve(JSON.parse(data))
      } catch (e) {
        reject(e)
      }
    })
  })
}

export function writeJsonFile(filePath: string, data: any): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8', (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

export function generateNewId(items: { id: number }[]): number {
  if (!items || items.length === 0) return 1
  return Math.max(...items.map(i => i.id)) + 1
}

export function getDataPath(filename: string): string {
  return path.join(dataDir, `${filename}.json`)
}
