import { NextRequest, NextResponse } from 'next/server';
import { getObjectStream, signedGetUrl } from '@/lib/s3';

// Formats served from this domain, which next/image needs because it can't follow a redirect
// for a local image. Everything else, including SVG, which can contain scripts, keeps
// redirecting to the storage domain.
const SERVED_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key: segments } = await params;
  const key = segments.map(decodeURIComponent).join('/');
  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  }

  const contentType = SERVED_TYPES[key.split('.').pop()?.toLowerCase() ?? ''];

  try {
    if (!contentType) {
      return NextResponse.redirect(await signedGetUrl(key, 3600), 302);
    }

    const { body, contentLength } = await getObjectStream(key);
    return new Response(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${THIRTY_DAYS}`,
        'X-Content-Type-Options': 'nosniff',
        ...(contentLength ? { 'Content-Length': String(contentLength) } : {}),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
