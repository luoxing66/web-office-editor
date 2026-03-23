import { createReadStream, existsSync } from 'node:fs'
import { join } from 'node:path'
import { getUploadsDir, sanitizeFileName } from '../../utils/upload'

export default defineEventHandler((event) => {
  const name = sanitizeFileName(getRouterParam(event, 'name') || '')

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: '无效的文件名' })
  }

  const filePath = join(getUploadsDir(), name)

  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: '文件不存在' })
  }

  setHeader(event, 'Content-Disposition', `attachment; filename="${encodeURIComponent(name)}"`)
  return sendStream(event, createReadStream(filePath))
})
