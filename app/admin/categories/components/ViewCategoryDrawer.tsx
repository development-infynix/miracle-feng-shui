'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Alert from '@/app/components/alert';
import ImageUploadField from '@/components/admin/ImageUploadField';
import { FaArrowUpRightFromSquare } from 'react-icons/fa6';
import { LuFolderOpen, LuPencil, LuTrash2, LuX } from 'react-icons/lu';
import { CategoryItem, CategoryOption } from '../types';
import CategorySelect from './CategorySelect';

interface ViewCategoryDrawerProps {
  category: CategoryItem;
  categoryOptions: CategoryOption[];
  onClose: () => void;
  onSaved: (updated: CategoryItem) => void;
  onDeleted: (name: string) => void;
}

const inputClass =
  'w-full rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10';

const labelClass = 'block text-xs font-semibold text-stone-500 mb-1.5';

export default function ViewCategoryDrawer({
  category,
  categoryOptions,
  onClose,
  onSaved,
  onDeleted,
}: ViewCategoryDrawerProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [image, setImage] = useState(category.image);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const reassignOptions = categoryOptions.filter((option) => option.id !== category.id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reassignTo, setReassignTo] = useState(reassignOptions[0]?.id || '');

  const hasProducts = category.productCount > 0;
  const productLabel = `${category.productCount} ${category.productCount === 1 ? 'product' : 'products'}`;

  const startEditing = () => {
    setName(category.name);
    setDescription(category.description);
    setImage(category.image);
    setError('');
    setEditing(true);
  };

  const saveChanges = async () => {
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Category name is required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Empty strings are sent on purpose, so a description or image can be cleared.
        body: JSON.stringify({
          name: cleanName,
          description: description.trim(),
          imageUrl: image.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save changes.');
      }
      setEditing(false);
      onSaved({ ...category, name: cleanName, description: description.trim(), image: image.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hasProducts ? { reassignToCategoryId: reassignTo } : {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete category.');
      }
      onDeleted(category.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category.');
      setConfirmDelete(false);
      setDeleting(false);
    }
  };

  let deleteDescription = `"${category.name}" will be permanently removed. This action cannot be undone.`;
  if (hasProducts) {
    deleteDescription = reassignOptions.length
      ? `"${category.name}" will be permanently removed. Choose where to move its ${productLabel}.`
      : `"${category.name}" has ${productLabel} and there is no other category to move them to. Create another category first.`;
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-details-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-[#fafaf9] shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-stone-200 px-6">
          <h2 id="category-details-title" className="text-xl font-bold text-stone-900">
            {editing ? 'Edit Category' : 'Category Details'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close category details"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            <LuX className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
          {error && (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {editing ? (
            <>
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
                  <label htmlFor="edit-category-name" className={labelClass}>Category Name *</label>
                  <input
                    id="edit-category-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="edit-category-description" className={labelClass}>Description</label>
                  <textarea
                    id="edit-category-description"
                    rows={4}
                    placeholder="Brief description of sacred items in this collection..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </section>
            </>
          ) : (
            <>
              <div className="rounded-lg overflow-hidden border border-stone-200 bg-white">
                {category.image ? (
                  <img src={category.image} alt={category.name} className="w-full h-64 object-cover" />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center text-stone-300">
                    <LuFolderOpen className="h-12 w-12" aria-hidden="true" />
                  </div>
                )}
              </div>

              <section>
                <h4 className="font-bold text-stone-900 text-lg leading-snug">{category.name}</h4>
                {category.description ? (
                  <p className="text-sm leading-relaxed text-stone-700 whitespace-pre-wrap mt-2">
                    {category.description}
                  </p>
                ) : (
                  <p className="text-sm text-stone-400 mt-2">No description.</p>
                )}
              </section>

              <section>
                <dl className="divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white px-4">
                  <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                    <dt className="text-stone-500">Active products</dt>
                    <dd className="font-medium text-stone-900">{category.activeCount}</dd>
                  </div>
                  <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                    <dt className="text-stone-500">Inactive products</dt>
                    <dd className="font-medium text-stone-900">{category.inactiveCount}</dd>
                  </div>
                  <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                    <dt className="text-stone-500">Slug</dt>
                    <dd className="font-medium text-stone-900 font-mono text-xs break-all">{category.slug}</dd>
                  </div>
                </dl>
              </section>
            </>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-stone-200 bg-[#fafaf9] px-5 py-4">
          {editing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError('');
                }}
                disabled={saving}
                className="inline-flex h-10 items-center justify-center rounded-md border border-stone-300 px-4 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveChanges}
                disabled={saving || !name.trim()}
                className="inline-flex h-10 items-center justify-center rounded-md bg-stone-900 px-5 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/admin/products?category=${encodeURIComponent(category.name)}`}
                aria-label={`View products in ${category.name}`}
                title="View products in this category"
                style={{ color: '#ffffff' }}
                className="mr-auto inline-flex h-10 w-10 items-center justify-center rounded-md bg-stone-900 transition-colors hover:bg-stone-700"
              >
                <FaArrowUpRightFromSquare className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                aria-label={`Edit ${category.name}`}
                title="Edit category"
                onClick={startEditing}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-stone-900 text-white transition-colors hover:bg-stone-700"
              >
                <LuPencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={`Delete ${category.name}`}
                title="Delete category"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                <LuTrash2 className="h-4 w-4" />
                Delete
              </button>
            </>
          )}
        </footer>

        <Alert
          open={confirmDelete}
          tone="danger"
          title="Delete this category?"
          description={deleteDescription}
          onClose={() => setConfirmDelete(false)}
          actions={[
            {
              label: 'Cancel',
              onClick: () => setConfirmDelete(false),
              variant: 'default',
              disabled: deleting,
            },
            {
              label: deleting ? 'Deleting...' : hasProducts ? 'Move & Delete' : 'Delete',
              onClick: handleDelete,
              variant: 'danger',
              disabled: deleting || (hasProducts && !reassignTo),
            },
          ]}
        >
          {hasProducts && reassignOptions.length > 0 && (
            <div>
              <span id="reassign-category-label" className={labelClass}>Move products to</span>
              <CategorySelect
                labelId="reassign-category-label"
                value={reassignTo}
                options={reassignOptions}
                onChange={setReassignTo}
              />
            </div>
          )}
        </Alert>
      </aside>
    </div>
  );
}
