'use client';

import React, { useRef, useState } from 'react';
import { LuChevronLeft, LuChevronRight, LuImagePlus, LuStar, LuTrash2 } from 'react-icons/lu';

export const MAX_PRODUCT_IMAGES = 10;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // matches the upload endpoint
const ACCEPTED = 'image/png,image/jpeg,image/webp,image/gif,image/avif';

/**
 * Edits a product's photos: add, remove, reorder, and pick the main one (the first, shown on cards).
 * Changes stay in the form until the product is saved. Removed photos are not deleted from storage,
 * because past orders keep a link to the photo they were bought with.
 */
export default function ProductImagesEditor({
  images,
  onChange,
  onUploadingChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState('');
  const room = MAX_PRODUCT_IMAGES - images.length;

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const remove = (index: number) => onChange(images.filter((_, i) => i !== index));

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError('');
    const picked = Array.from(files);
    const accepted = picked.slice(0, Math.max(0, room));
    const problems: string[] = [];
    if (picked.length > accepted.length) problems.push(`Only ${MAX_PRODUCT_IMAGES} photos are allowed per product.`);

    setUploading(accepted.length);
    onUploadingChange?.(true);
    const added: string[] = [];
    for (const file of accepted) {
      if (!ACCEPTED.split(',').includes(file.type)) {
        problems.push(`${file.name}: use PNG, JPEG, WEBP, GIF or AVIF.`);
      } else if (file.size > MAX_FILE_BYTES) {
        problems.push(`${file.name}: must be under 10MB.`);
      } else {
        try {
          const body = new FormData();
          body.append('file', file);
          const res = await fetch('/api/upload', { method: 'POST', body });
          const json = await res.json().catch(() => ({}));
          if (res.ok && json.success && json.data?.url) added.push(json.data.url);
          else problems.push(`${file.name}: ${json.error || 'upload failed'}.`);
        } catch {
          problems.push(`${file.name}: upload failed, check your connection.`);
        }
      }
      setUploading((n) => n - 1);
    }
    if (added.length) onChange([...images, ...added]);
    setError(problems.join(' '));
    setUploading(0);
    onUploadingChange?.(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm font-semibold text-stone-900">Photos</span>
        <span className="text-xs text-stone-500 tabular-nums">
          {images.length} / {MAX_PRODUCT_IMAGES} &middot; the first is the main photo
        </span>
      </div>

      <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2 list-none p-0 m-0">
        {images.map((src, i) => (
          <li key={`${src}-${i}`} className="group relative aspect-square overflow-hidden rounded-md border border-stone-200 bg-white">
            <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded bg-stone-900 px-1.5 py-0.5 text-[10px] font-semibold text-white">Main</span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-0.5 bg-black/55 p-1">
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move photo ${i + 1} earlier`} title="Move earlier" className="flex h-6 w-6 items-center justify-center rounded text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent">
                <LuChevronLeft className="h-3.5 w-3.5" />
              </button>
              {i !== 0 && (
                <button type="button" onClick={() => move(i, 0)} aria-label={`Make photo ${i + 1} the main photo`} title="Make main photo" className="flex h-6 w-6 items-center justify-center rounded text-white hover:bg-white/20">
                  <LuStar className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                disabled={images.length === 1}
                aria-label={`Remove photo ${i + 1}`}
                title={images.length === 1 ? 'A product needs at least one photo' : 'Remove photo'}
                className="flex h-6 w-6 items-center justify-center rounded text-white hover:bg-red-600 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <LuTrash2 className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => move(i, i + 1)} disabled={i === images.length - 1} aria-label={`Move photo ${i + 1} later`} title="Move later" className="flex h-6 w-6 items-center justify-center rounded text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent">
                <LuChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}

        {Array.from({ length: uploading }).map((_, i) => (
          <li key={`uploading-${i}`} className="aspect-square rounded-md border border-dashed border-stone-300 bg-stone-100 animate-pulse flex items-center justify-center text-[11px] text-stone-500">
            Uploading…
          </li>
        ))}

        {room > 0 && uploading === 0 && (
          <li>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-stone-300 bg-white text-xs font-medium text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-colors"
            >
              <LuImagePlus className="h-5 w-5" />
              Add photos
            </button>
          </li>
        )}
      </ul>

      <input ref={inputRef} type="file" accept={ACCEPTED} multiple hidden onChange={(e) => upload(e.target.files)} />
      {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
