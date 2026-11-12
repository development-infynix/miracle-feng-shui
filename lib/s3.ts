import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'auto',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: false,
});

export const S3_BUCKET = process.env.S3_BUCKET!;

export function publicObjectUrl(key: string) {
  // Proxy path served by our own API (works whether or not the bucket is public)
  return `/api/images/${key.split('/').map(encodeURIComponent).join('/')}`;
}

export async function uploadToS3(key: string, body: Buffer, contentType?: string) {
  await s3.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
  return key;
}

export async function getObjectStream(key: string) {
  const object = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }));
  if (!object.Body) throw new Error(`Empty object: ${key}`);
  return { body: object.Body.transformToWebStream(), contentLength: object.ContentLength };
}

export async function signedGetUrl(key: string, expiresIn = 3600) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }), { expiresIn });
}

export async function deleteFromS3(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
}

const PROXY_PREFIX = '/api/images/';
// Folders our own uploads and moved-over product photos live in. Nothing else is ever deleted.
const DELETABLE_PREFIXES = ['uploads/', 'products/'];

/** The storage key behind one of our image URLs (see publicObjectUrl), or null for anything else. */
export function objectKeyFromUrl(url: string) {
  if (!url.startsWith(PROXY_PREFIX)) return null;
  let key: string;
  try {
    key = url.slice(PROXY_PREFIX.length).split('?')[0].split('/').map(decodeURIComponent).join('/');
  } catch {
    return null;
  }
  const parts = key.split('/');
  if (!DELETABLE_PREFIXES.some((prefix) => key.startsWith(prefix)) || parts.some((p) => !p || p === '.' || p === '..')) {
    return null;
  }
  return key;
}
