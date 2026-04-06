import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allowed entity types for uploads
export type UploadEntity = 'products' | 'categories' | 'coupons' | 'staff';

export const ALLOWED_ENTITIES: UploadEntity[] = ['products', 'categories', 'coupons', 'staff'];

// Allowed MIME types and extensions
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Maximum file size: 3MB
export const MAX_FILE_SIZE = 3 * 1024 * 1024;

// Upload directory base path
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

// Ensure upload directories exist
export function ensureUploadDirectories(): void {
  for (const entity of ALLOWED_ENTITIES) {
    const entityDir = path.join(UPLOADS_DIR, entity);
    if (!fs.existsSync(entityDir)) {
      fs.mkdirSync(entityDir, { recursive: true });
    }
  }
}

// Initialize directories on module load
ensureUploadDirectories();

/**
 * Get the uploads directory path
 */
export function getUploadsDir(): string {
  return UPLOADS_DIR;
}

/**
 * Delete a file from disk
 * @param filePath - Relative path from uploads directory (e.g., "products/filename.jpg")
 * @returns Promise<boolean> - True if deleted successfully
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const absolutePath = path.join(UPLOADS_DIR, filePath);
    
    // Security check: ensure path is within uploads directory
    if (!absolutePath.startsWith(UPLOADS_DIR)) {
      console.error('[UploadService] Invalid file path attempt:', filePath);
      return false;
    }

    if (fs.existsSync(absolutePath)) {
      await fs.promises.unlink(absolutePath);
      console.log('[UploadService] File deleted:', filePath);
      return true;
    }

    console.warn('[UploadService] File not found:', filePath);
    return false;
  } catch (error) {
    console.error('[UploadService] Error deleting file:', error);
    return false;
  }
}
