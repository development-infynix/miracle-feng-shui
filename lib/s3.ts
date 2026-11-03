import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
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
