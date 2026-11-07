'use client';

import React, { useState } from 'react';
import { LuX } from 'react-icons/lu';
import ItemDetailsField from './ItemDetailsField';
import ProductImagesEditor from './ProductImagesEditor';
import { Product } from '@/lib/placeholder-data';

interface AddProductModalProps {
  open: boolean;
  editingProduct: Product | null;
  formData: Omit<Product, 'id'>;
  setFormData: (updater: React.SetStateAction<Omit<Product, 'id'>>) => void;
  availableCategories: string[] | readonly string[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting?: boolean;
}

const inputClass =
  'w-full rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10';

const labelClass = 'block text-xs font-semibold text-stone-500 mb-1.5';

export default function AddProductModal({
  open,
  editingProduct,
  formData,
  setFormData,
  availableCategories,
  onClose,
  onSubmit,
  isSubmitting,
}: AddProductModalProps) {
  const [imagesUploading, setImagesUploading] = useState(false);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-product-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-[#fafaf9] shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-stone-200 px-6">
          <h2 id="add-product-title" className="text-xl font-bold text-stone-900">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
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

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
            <section>
              <ProductImagesEditor
                images={formData.images || []}
                onChange={(next) => setFormData((prev) => ({ ...prev, images: next }))}
                onUploadingChange={setImagesUploading}
              />
            </section>

            <section className="space-y-4">
              <div>
                <label className={labelClass}>Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Blessed Cinnabar Bracelet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  rows={4}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description, spiritual blessing details, materials..."
                  className={inputClass}
                />
              </div>
              <ItemDetailsField
                value={formData.itemDetails || []}
                onChange={(itemDetails) => setFormData({ ...formData, itemDetails })}
              />
            </section>

            <section>
              <dl className="divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white px-4">
                <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                  <dt className="text-stone-500">Price (₹) *</dt>
                  <dd>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="e.g. 999"
                      value={formData.price && formData.price > 0 ? formData.price : ''}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value === '' ? 0 : Number(e.target.value) })
                      }
                      className={inputClass}
                    />
                  </dd>
                </div>
                <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                  <dt className="text-stone-500">Original price</dt>
                  <dd>
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 1499"
                      value={formData.originalPrice ? formData.originalPrice : ''}
                      onChange={(e) =>
                        setFormData({ ...formData, originalPrice: e.target.value === '' ? undefined : Number(e.target.value) })
                      }
                      className={inputClass}
                    />
                  </dd>
                </div>
                <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                  <dt className="text-stone-500">Discount</dt>
                  <dd>
                    <input
                      type="text"
                      placeholder="e.g. 33% off"
                      value={formData.discount || ''}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className={inputClass}
                    />
                  </dd>
                </div>
                <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                  <dt className="text-stone-500">Stock *</dt>
                  <dd>
                    <input
                      type="number"
                      min={0}
                      required
                      placeholder="e.g. 50"
                      value={formData.stock !== undefined ? formData.stock : ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock: e.target.value === '' ? undefined : Math.max(0, parseInt(e.target.value) || 0),
                        })
                      }
                      className={inputClass}
                    />
                  </dd>
                </div>
                <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                  <dt className="text-stone-500">Rating</dt>
                  <dd>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      step={0.1}
                      placeholder="e.g. 4.9"
                      value={formData.rating != null && formData.rating > 0 ? formData.rating : ''}
                      onChange={(e) =>
                        setFormData({ ...formData, rating: e.target.value === '' ? 0 : Math.max(0, Math.min(5, Number(e.target.value))) })
                      }
                      className={inputClass}
                    />
                  </dd>
                </div>
                <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                  <dt className="text-stone-500">Category *</dt>
                  <dd>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={`${inputClass} bg-white`}
                    >
                      {availableCategories.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </dd>
                </div>
                <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                  <dt className="text-stone-500">Maker</dt>
                  <dd>
                    <input
                      type="text"
                      placeholder="e.g. Miracle Feng Shui Studio"
                      value={formData.maker}
                      onChange={(e) => setFormData({ ...formData, maker: e.target.value })}
                      className={inputClass}
                    />
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-xs font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={formData.bestseller}
                    onChange={(e) => setFormData({ ...formData, bestseller: e.target.checked })}
                    className="h-4 w-4 rounded-md border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <span>Bestseller</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={formData.etsyPick}
                    onChange={(e) => setFormData({ ...formData, etsyPick: e.target.checked })}
                    className="h-4 w-4 rounded-md border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <span>Miracle Pick</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={formData.freeShipping}
                    onChange={(e) => setFormData({ ...formData, freeShipping: e.target.checked })}
                    className="h-4 w-4 rounded-md border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <span>Free Shipping</span>
                </label>
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
              disabled={isSubmitting || imagesUploading || !formData.category || !formData.name.trim() || !formData.price || formData.price <= 0 || formData.discount == null || String(formData.discount).trim() === '' || formData.stock == null || String(formData.maker || '').trim() === ''}
              className="inline-flex h-10 items-center justify-center rounded-md bg-stone-900 px-5 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (editingProduct ? 'Saving...' : 'Adding...') : (editingProduct ? 'Save Changes' : 'Add to Catalog')}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
