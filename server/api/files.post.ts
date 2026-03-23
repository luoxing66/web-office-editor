import { writeFileSync } from 'node:fs'
import { join, extname } from 'node:path'
import { getUploadsDir, sanitizeFileName } from '../utils/upload'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const ALLOWED_EXTENSIONS = new Set([
  '.doc', '.docx',   // Word
  '.xls', '.xlsx',   // Excel
  '.ppt', '.pptx',   // PowerPoint
])

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '未选择上传文件' })
  }

  const uploadsDir = getUploadsDir()
  const uploaded: string[] = []

  for (const file of formData) {
    if (!file.filename || !file.data) continue

    if (file.data.length > MAX_FILE_SIZE) {
      throw createError({
        statusCode: 413,
        statusMessage: `文件「${file.filename}」超过 5MB 大小限制`,
      })
    }

    const safeName = sanitizeFileName(file.filename)
    if (!safeName) {
      throw createError({ statusCode: 400, statusMessage: '无效的文件名' })
    }

    const ext = extname(safeName).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw createError({
        statusCode: 400,
        statusMessage: `不支持的文件类型「${ext}」，仅允许上传 Office 文件（doc/docx/xls/xlsx/ppt/pptx）`,
      })
    }

    writeFileSync(join(uploadsDir, safeName), file.data)
    uploaded.push(safeName)
  }

  return { success: true, files: uploaded }
})
