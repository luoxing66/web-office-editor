import { createReadStream, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { getUploadsDir, sanitizeFileName } from "../../utils/upload";

export default defineEventHandler((event) => {
  const safeName = sanitizeFileName(getQuery(event).object as string);
  if (!safeName) {
    throw createError({ statusCode: 400, statusMessage: "无效的文件名" });
  }

  const filePath = join(getUploadsDir(), safeName);
  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: "文件不存在" });
  }

  setResponseHeader(event, "Content-Length", statSync(filePath).size);
  return sendStream(event, createReadStream(filePath));
});
