import prisma from '@/lib/prisma';
import { uploadToS3, publicObjectUrl } from '../lib/s3';
import fs from 'fs/promises';
import path from 'path';

const MAX = Number(process.env.MIGRATE_LIMIT || '0');

function extFrom(contentType: string | null, url: string) {
  const map: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
  };
  if (contentType && map[contentType.split(';')[0].trim()]) return map[contentType.split(';')[0].trim()];
  const m = url.split('?')[0].match(/\.([a-zA-Z0-9]+)$/);
  return m ? m[1].toLowerCase() : 'jpg';
}

async function toBuffer(src: string): Promise<{ buf: Buffer; type: string | null }> {
  if (src.startsWith('/uploads/')) {
    const fp = path.join(process.cwd(), 'public', src.replace(/^\//, ''));
    const buf = await fs.readFile(fp);
    return { buf, type: null };
  }
  if (src.startsWith('/')) {
    // local public asset; read from disk if possible
    const fp = path.join(process.cwd(), 'public', src.replace(/^\//, ''));
    try {
      const buf = await fs.readFile(fp);
      return { buf, type: null };
    } catch {
      // fall through to fetch (won't work for local without server)
    }
  }
  const res = await fetch(src);
  if (!res.ok) throw new Error(`fetch ${res.status} ${src}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return { buf, type: res.headers.get('content-type') };
}

async function main() {
  const products = await prisma.product.findMany({ select: { id: true, slug: true, images: true } });
  const targets = MAX > 0 ? products.slice(0, MAX) : products;
  console.log(`Migrating ${targets.length} products`);

  let done = 0;
  for (const p of targets) {
    const newImages: string[] = [];
    for (let i = 0; i < p.images.length; i++) {
      const src = p.images[i];
      if (!src || src.startsWith('/api/images/') || src.includes('.t3.storage.dev/')) {
        newImages.push(src);
        continue;
      }
      try {
        const { buf, type } = await toBuffer(src);
        const ext = extFrom(type, src);
        const key = `products/${p.id}/${i}.${ext}`;
        await uploadToS3(key, buf, type || undefined);
        newImages.push(publicObjectUrl(key));
        process.stdout.write('.');
      } catch (err: any) {
        console.error(`\nFailed ${p.id} img ${i}: ${err.message}`);
        newImages.push(src); // keep original on failure
      }
    }
    await prisma.product.update({ where: { id: p.id }, data: { images: newImages } });
    done++;
    if (done % 5 === 0) console.log(` ${done}/${targets.length}`);
  }
  console.log(`\nDone: ${done}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
