// Size hint for cards in the admin grids, which run from 1 to 5 columns.
export const ADMIN_CARD_IMAGE_SIZES =
  '(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw';

// Only this site's own raster images can be resized. Remote hosts aren't configured for
// next/image, and SVG files aren't optimized.
export const canResizeImage = (src: string) =>
  src.startsWith('/') && !src.toLowerCase().endsWith('.svg');
