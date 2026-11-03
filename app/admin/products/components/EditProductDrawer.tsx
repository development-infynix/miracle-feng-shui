'use client';

import React from 'react';
import ImageUploadField from '@/components/admin/ImageUploadField';
import { Product } from '@/lib/placeholder-data';
import ItemDetailsField from './ItemDetailsField';

interface AddProductModalProps {
  open: boolean;
  editingProduct: Product | null;
  formData: Omit<Product, 'id'>;
  setFormData: (updater: React.SetStateAction<Omit<Product, 'id'>>) => void;
  availableCategories: string[] | readonly string[];
  isUploading: boolean;
  onImageFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting?: boolean;
}

export default function AddProductModal({
  open,
  editingProduct,
  formData,
  setFormData,
  availableCategories,
  isUploading,
  onImageFileUpload,
  onClose,
  onSubmit,
  isSubmitting,
}: AddProductModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl flex flex-col gap-4 p-6 sm:p-8 overflow-y-auto animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              Edit Product
            </h3>
            <span className="text-xs text-gray-400">
              Modifying ID: {editingProduct?.id}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <i className="fa-solid fa-xmark text-base" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <ImageUploadField
              label="Product Image"
              value={formData.images[0] || ''}
              onChange={(url) => setFormData({ ...formData, images: url ? [url] : [] })}
              helpText="Upload product image file (PNG, JPG, or WEBP)."
            />
            <input type="file" className="hidden" onChange={onImageFileUpload} />
            {isUploading && (
              <p className="text-xs text-gray-500 mt-1">Uploading…</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Product Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master Blessed Cinnabar Bracelet"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Product Description
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description, spiritual blessing details, materials..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-black"
            />
          </div>

          <ItemDetailsField
            value={formData.itemDetails || []}
            onChange={(itemDetails) => setFormData({ ...formData, itemDetails })}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder="e.g. 999"
                value={formData.price && formData.price > 0 ? formData.price : ''}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value === '' ? 0 : Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Discount Label
              </label>
              <input
                type="text"
                placeholder="e.g. 33% off"
                value={formData.discount || ''}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Original Price (₹)
              </label>
              <input
                type="number"
                min={1}
                placeholder="e.g. 1499"
                value={formData.originalPrice ? formData.originalPrice : ''}
                onChange={(e) =>
                  setFormData({ ...formData, originalPrice: e.target.value === '' ? undefined : Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                <span>Stock Level *</span>
                <span className="text-[10px] text-gray-500 font-normal">&lt;10 alerts store</span>
              </label>
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
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:border-black"
              >
                {availableCategories.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Shop / Maker Name
              </label>
              <input
                type="text"
                placeholder="e.g. Miracle Feng Shui Studio"
                value={formData.maker}
                onChange={(e) => setFormData({ ...formData, maker: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-black"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-1 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                checked={formData.bestseller}
                onChange={(e) => setFormData({ ...formData, bestseller: e.target.checked })}
                className="w-4 h-4 rounded-md border-gray-300 text-black focus:ring-black"
              />
              <span>Bestseller Tag</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                checked={formData.etsyPick}
                onChange={(e) => setFormData({ ...formData, etsyPick: e.target.checked })}
                className="w-4 h-4 rounded-md border-gray-300 text-black focus:ring-black"
              />
              <span>Miracle Pick Tag</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                checked={formData.freeShipping}
                onChange={(e) => setFormData({ ...formData, freeShipping: e.target.checked })}
                className="w-4 h-4 rounded-md border-gray-300 text-black focus:ring-black"
              />
              <span>Free Delivery</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim() || !formData.price || formData.price <= 0 || formData.discount == null || String(formData.discount).trim() === '' || formData.stock == null || String(formData.maker || '').trim() === ''}
              style={{ backgroundColor: '#040404', color: '#ffffff', opacity: (isSubmitting || !formData.name.trim() || !formData.price || formData.price <= 0 || formData.discount == null || String(formData.discount).trim() === '' || formData.stock == null || String(formData.maker || '').trim() === '') ? 0.7 : 1 }}
              className="px-6 py-2.5 text-xs font-semibold bg-[#040404] hover:bg-black text-white rounded-full shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? 'Updating...' : 'Update Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
