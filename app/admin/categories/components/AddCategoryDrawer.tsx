'use client';

import React, { useState } from 'react';
import ImageUploadField from '@/components/admin/ImageUploadField';
import { LuX } from 'react-icons/lu';

interface AddCategoryDrawerProps {
  onClose: () => void;
  onCreated: (name: string) => void;
}

const inputClass =
  'w-full rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10';

const labelClass = 'block text-xs font-semibold text-stone-500 mb-1.5';

export default function AddCategoryDrawer({ onClose, onCreated }: AddCategoryDrawerProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          description: description.trim() || undefined,
          imageUrl: image.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create category.');
      }
      onCreated(cleanName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-category-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-[#fafaf9] shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-stone-200 px-6">
          <h2 id="add-category-title" className="truncate text-xl font-bold text-stone-900">
            Add New Category
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            <LuX className="h-4 w-4" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
            {error && (
              <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <section>
              <ImageUploadField
                label="Category Banner / Icon Image"
                value={image}
                onChange={setImage}
                helpText="Upload a category photo from your computer (PNG, JPG, or WEBP)."
              />
            </section>

            <section className="space-y-4">
              <div>
                <label htmlFor="add-category-name" className={labelClass}>Category Name *</label>
                <input
                  id="add-category-name"
                  type="text"
                  required
                  placeholder="e.g. Incense & Singing Bowls"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="add-category-description" className={labelClass}>Description (Optional)</label>
                <textarea
                  id="add-category-description"
                  rows={4}
                  placeholder="Brief description of sacred items in this collection..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={inputClass}
                />
              </div>
            </section>
          </div>

          <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-stone-200 bg-[#fafaf9] px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-md border border-stone-300 px-4 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="inline-flex h-10 items-center justify-center rounded-md bg-stone-900 px-5 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Category'}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
