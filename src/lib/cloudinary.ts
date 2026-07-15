// Cloudinary delivery helpers for the support app.
// Product/banner images in DB are Cloudinary upload URLs; inject transforms for fast display.

const CLOUD_NAME =
  (process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'vpagrbf4').trim();

export function isCloudinaryUploadUrl(src?: string | null): boolean {
  if (!src) return false;
  try {
    const u = new URL(src);
    return u.hostname === 'res.cloudinary.com' && u.pathname.includes('/image/upload/');
  } catch {
    return false;
  }
}

export function optimizeImageUrl(
  originalUrl?: string | null,
  width = 600,
): string | undefined {
  if (!originalUrl) return undefined;
  if (!CLOUD_NAME) return originalUrl;

  const transforms = ['f_auto', 'q_auto', 'c_limit', `w_${Math.round(width)}`];
  const t = transforms.join(',');

  if (isCloudinaryUploadUrl(originalUrl)) {
    if (/\/image\/upload\/[^/]*f_auto/.test(originalUrl)) {
      if (!/\/w_\d+/.test(originalUrl)) {
        return originalUrl.replace(/\/image\/upload\/([^/]+)\//, (_m, existing) => {
          return `/image/upload/${existing},w_${Math.round(width)}/`;
        });
      }
      return originalUrl;
    }
    return originalUrl.replace('/image/upload/', `/image/upload/${t}/`);
  }

  if (originalUrl.startsWith('http://') || originalUrl.startsWith('https://')) {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${t}/${encodeURIComponent(originalUrl)}`;
  }

  return originalUrl;
}
