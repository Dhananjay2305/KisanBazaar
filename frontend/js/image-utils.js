/** Legacy Express backend static uploads (local dev or Vercel /_/backend). */
export function getLegacyApiBase() {
  const fromEnv = String(import.meta.env?.VITE_API_BASE ?? '').trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (typeof window !== 'undefined' && window.location?.origin) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://127.0.0.1:5001';
    }
    return `${window.location.origin}/_/backend`;
  }

  return 'http://127.0.0.1:5001';
}

const DEFAULT_LISTING_IMAGE =
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=200&fit=crop';

/**
 * Resolve listing/profile image paths for <img src>.
 * Supports Supabase public URLs, data URLs, blob URLs, and legacy /uploads paths.
 */
export function resolveImageUrl(imagePath, fallback = DEFAULT_LISTING_IMAGE) {
  if (!imagePath || typeof imagePath !== 'string') return fallback;
  const trimmed = imagePath.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  const base = getLegacyApiBase();
  if (trimmed.startsWith('/')) {
    return `${base}${trimmed}`;
  }
  return `${base}/${trimmed}`;
}

export function sanitizeFileName(name) {
  const base = (name || 'image.jpg').split(/[/\\]/).pop();
  return base.replace(/[^\w.\-]+/g, '_').slice(0, 120) || 'image.jpg';
}

/** Resize large photos before upload so storage/DB limits are less likely to fail. */
export async function compressImageFile(file, maxWidth = 1200, quality = 0.85) {
  if (!file?.type?.startsWith('image/')) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / Math.max(bitmap.width, bitmap.height, 1));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Could not compress image'))),
        'image/jpeg',
        quality
      );
    });

    const safeName = sanitizeFileName(file.name).replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], safeName, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
}
