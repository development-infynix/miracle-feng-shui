import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { uploadToS3, publicObjectUrl } from '@/lib/s3';
import { apiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
};

export const uploadController = {
  async handleUpload(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      throw ApiError.badRequest('No valid image file provided');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw ApiError.badRequest('File size exceeds the 10MB maximum limit');
    }

    const mimeType = file.type;
    const extension = ALLOWED_MIME_TYPES[mimeType];
    if (!extension) {
      throw ApiError.badRequest(
        `Invalid file format (${mimeType}). Only PNG, JPEG, WEBP, GIF, SVG, and AVIF images are supported.`
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const randomHex = crypto.randomBytes(6).toString('hex');
    const filename = `mfs_${Date.now()}_${randomHex}.${extension}`;
    const key = `uploads/${filename}`;

    await uploadToS3(key, buffer, mimeType);

    const publicUrl = publicObjectUrl(key);
    return apiResponse.ok({ url: publicUrl, filename, size: file.size, key }, 201);
  },
};
