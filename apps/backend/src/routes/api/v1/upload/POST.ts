import { z } from 'zod';
import { createHandler } from 'hono-file-router';
import { authMiddleware } from '@/middleware/auth.js';
import { 
  ALLOWED_MIME_TYPES, 
  MAX_FILE_SIZE,
  getUploadsDir 
} from '@/services/upload.service.js';
import { success, error } from '@/utils/response.js';
import { ApiError } from '@/utils/api-error.js';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const uploadSchema = z.object({
  entity: z.enum(['products', 'categories', 'coupons', 'staff'] as const)
});

export default createHandler(async (c) => {
  try {
    const authFn = authMiddleware('admin');
    await authFn(c, async () => {});

    const contentType = c.req.header('Content-Type') || '';
    
    if (!contentType.includes('multipart/form-data')) {
      return error(c, 'BAD_REQUEST', 'Content-Type must be multipart/form-data', 400);
    }

    const rawReq = c.req.raw as unknown as { files?: Array<{ name: string; filename: string; type: string; size: number; data: Buffer }> };
    const file = rawReq.files?.[0];

    if (!file) {
      return error(c, 'BAD_REQUEST', 'No file provided', 400);
    }

    const entity = c.req.query('entity');
    if (!entity) {
      return error(c, 'BAD_REQUEST', 'Entity type is required', 400);
    }

    const parsed = uploadSchema.parse({ entity });

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return error(c, 'UNSUPPORTED_MEDIA_TYPE', 'File type not allowed. Allowed: jpg, jpeg, png, webp', 415);
    }

    if (file.size > MAX_FILE_SIZE) {
      return error(c, 'PAYLOAD_TOO_LARGE', `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`, 413);
    }

    const ext = path.extname(file.filename || '').toLowerCase();
    const uuid = uuidv4();
    const filename = `${uuid}${ext}`;
    const entityDir = path.join(getUploadsDir(), parsed.entity);
    const filepath = path.join(entityDir, filename);

    if (!fs.existsSync(entityDir)) {
      fs.mkdirSync(entityDir, { recursive: true });
    }

    await fs.promises.writeFile(filepath, file.data);

    const url = `/uploads/${parsed.entity}/${filename}`;

    return success(c, { url });
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return error(c, err.code, err.message, err.statusCode as 401);
    }
    if (err instanceof z.ZodError) {
      return error(c, 'VALIDATION_ERROR', err.errors[0].message, 400);
    }
    throw err;
  }
});
