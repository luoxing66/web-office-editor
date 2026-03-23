import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { getUploadsDir } from '../utils/upload'

export default defineEventHandler(() => {
  const uploadsDir = getUploadsDir()
  const files = readdirSync(uploadsDir)

  return files.map((name) => {
    const filePath = join(uploadsDir, name)
    const stat = statSync(filePath)
    return {
      name,
      size: stat.size,
      uploadedAt: stat.mtime.toISOString(),
    }
  })
})
