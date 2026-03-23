import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getUploadsDir, sanitizeFileName } from "../../utils/upload";

export default defineEventHandler(async (event) => {
  const safeName = sanitizeFileName(getQuery(event).object as string);
  if (!safeName) {
    throw createError({ statusCode: 400, statusMessage: "无效的文件名" });
  }

  const filePath = join(getUploadsDir(), safeName);
  const body = await readRawBody(event, false);

  writeFileSync(filePath, body!);
});
