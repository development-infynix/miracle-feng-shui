import { NextRequest, NextResponse } from 'next/server';
import { signedGetUrl } from '@/lib/s3';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key: segments } = await params;
  const key = segments.map(decodeURIComponent).join('/');
  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  }

  try {
    const url = await signedGetUrl(key, 3600);
    return NextResponse.redirect(url, 302);
  } catch (err) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
