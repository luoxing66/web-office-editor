import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const UPLOADS_DIR = join(process.cwd(), 'uploads')

export function getUploadsDir(): string {
  if (!existsSync(UPLOADS_DIR)) {
    mkdirSync(UPLOADS_DIR, { recursive: true })
  }
  return UPLOADS_DIR
}

export function sanitizeFileName(name: string): string {
  // Remove path traversal and dangerous characters
  return name
    .replace(/\.\./g, '')
    .replace(/[/\\:*?"<>|]/g, '')
    .trim()
}
