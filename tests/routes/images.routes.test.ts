import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const s3 = vi.hoisted(() => ({
  getObjectStream: vi.fn(),
  signedGetUrl: vi.fn(),
}));

vi.mock('@/lib/s3', () => s3);

import { GET } from '@/app/api/images/[...key]/route';

const get = (...key: string[]) =>
  GET(new NextRequest('http://localhost/api/images'), { params: Promise.resolve({ key }) });

beforeEach(() => {
  vi.clearAllMocks();
  s3.getObjectStream.mockResolvedValue({ body: 'image-bytes', contentLength: 11 });
  s3.signedGetUrl.mockResolvedValue('https://storage.example.com/signed');
});

describe('GET /api/images/[...key]', () => {
  it('serves images from the uploads folder', async () => {
    const res = await get('uploads', 'photo.jpg');
    expect(res.status).toBe(200);
    expect(s3.getObjectStream).toHaveBeenCalledWith('uploads/photo.jpg');
  });

  it('serves images from the products folder', async () => {
    const res = await get('products', 'p1', '0.webp');
    expect(res.status).toBe(200);
    expect(s3.getObjectStream).toHaveBeenCalledWith('products/p1/0.webp');
  });

  it('still redirects other file types inside a public folder', async () => {
    const res = await get('uploads', 'logo.svg');
    expect(res.status).toBe(302);
  });

  it('refuses keys outside the public folders, without touching storage', async () => {
    for (const key of [['backups', 'db.sql'], ['secret.png'], ['uploadsX', 'a.png']]) {
      const res = await get(...key);
      expect(res.status).toBe(404);
    }
    expect(s3.getObjectStream).not.toHaveBeenCalled();
    expect(s3.signedGetUrl).not.toHaveBeenCalled();
  });

  it('refuses dot segments, including encoded ones', async () => {
    for (const key of [['uploads', '..', 'backups', 'db.sql'], ['uploads', '%2E%2E', 'x.png']]) {
      const res = await get(...key);
      expect(res.status).toBe(404);
    }
    expect(s3.signedGetUrl).not.toHaveBeenCalled();
  });
});
