import { writeBinaryFile, copyFile } from '~/lib/tauri/commands';
import { dirname } from '~/lib/utils/path';

/** Supported image MIME types and their file extensions. */
export const IMAGE_FORMATS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

/** Set of supported image file extensions (lowercase). */
export const IMAGE_EXTENSIONS = new Set(Object.values(IMAGE_FORMATS));

function getAssetsDir(currentFilePath: string): string {
  return dirname(currentFilePath) + 'assets';
}

function generateImageName(ext: string): string {
  const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 6);
  return `img-${ts}-${rand}.${ext}`;
}

/** Save base64 image data to assets dir, return relative path. */
export async function saveBase64Image(base64: string, mimeType: string, currentFilePath: string): Promise<string> {
  const dir = getAssetsDir(currentFilePath);
  const ext = IMAGE_FORMATS[mimeType] ?? 'png';
  const name = generateImageName(ext);
  await writeBinaryFile(dir + '/' + name, base64);
  return 'assets/' + name;
}

/** Copy an external image file into assets dir, return relative path. */
export async function copyImageToAssets(sourcePath: string, currentFilePath: string): Promise<string> {
  const dir = getAssetsDir(currentFilePath);
  const ext = sourcePath.split('.').pop()?.toLowerCase() ?? 'png';
  const name = generateImageName(ext);
  await copyFile(sourcePath, dir + '/' + name);
  return 'assets/' + name;
}
