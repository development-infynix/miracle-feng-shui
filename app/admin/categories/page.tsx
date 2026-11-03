'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import ImageUploadField from '@/components/admin/ImageUploadField';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image?: string;
  imageUrl?: string;
  description?: string;
  productCount: number;
}

export default function AdminCategoriesPage() {
  const { refreshCategories: refreshStoreCategories } = useStore();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<CategoryItem | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState('');

  // Form state
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filtered list
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  // Overall statistics
  const totalProducts = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.productCount || 0), 0);
  }, [categories]);

  // Open Add Modal
  const openAddModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormImage('');
    setFormError('');
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description || '');
    setFormImage(cat.imageUrl || cat.image || '');
    setFormError('');
    setModalOpen(true);
  };

  const openDeleteModal = (cat: CategoryItem) => {
    setDeleteConfirmCat(cat);
    const other = categories.find((c) => c.id !== cat.id);
    setReassignTargetId(other ? other.id : '');
  };

  // Auto generate slug from name if creating
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormSlug(generated);
    }
  };

  // Submit Add or Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Category name is required');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim() || undefined,
        description: formDescription.trim() || undefined,
        imageUrl: formImage.trim() || undefined,
      };

      if (editingCategory) {
        // Update
        const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to update category');
        }
        showToast(`Category "${formName}" updated successfully!`);
      } else {
        // Create
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to create category');
        }
        showToast(`Category "${formName}" created successfully!`);
      }

      setModalOpen(false);
      await fetchCategories();
      await refreshStoreCategories();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while saving category');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Category
  const handleDelete = async () => {
    if (!deleteConfirmCat) return;

    setIsSubmitting(true);
    try {
      const bodyPayload =
        deleteConfirmCat.productCount > 0 && reassignTargetId
          ? { reassignToCategoryId: reassignTargetId }
          : {};

      const res = await fetch(`/api/admin/categories/${deleteConfirmCat.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete category');
      }
      showToast(
        deleteConfirmCat.productCount > 0
          ? `Category "${deleteConfirmCat.name}" deleted and products reassigned.`
          : `Category "${deleteConfirmCat.name}" deleted.`
      );
      setDeleteConfirmCat(null);
      await fetchCategories();
      await refreshStoreCategories();
    } catch (err: any) {
      alert(err.message || 'Could not delete category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      className="flex flex-col gap-6"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20 animate-in slide-in-from-bottom-5">
          <i className="fa-solid fa-circle-check text-emerald-400 text-base" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Luxury Noir Salon-Style Hero Page Banner with Right-Side Fade Image */}
      <div className="rounded-3xl bg-[#161619] p-6 sm:p-8 text-white shadow-xl border border-white/10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 min-h-[190px]">
        {/* Right-Side Photo with Seamless Noir Blend Gradient (matching reference screenshot) */}
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-3/5 lg:w-1/2 pointer-events-none overflow-hidden select-none">
          <img
            src="/images/feng_shui_hero_banner.jpg"
            alt="Miracle Categories Sanctuary"
            className="w-full h-full object-cover object-right brightness-[0.7] contrast-[1.08]"
          />
          {/* Seamless Left Fade Gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, #161619 0%, #161619 12%, rgba(22, 22, 25, 0.85) 42%, rgba(22, 22, 25, 0.25) 75%, transparent 100%)',
            }}
          />
          {/* Subtle Top & Bottom Vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(22, 22, 25, 0.35) 0%, transparent 25%, transparent 75%, rgba(22, 22, 25, 0.5) 100%)',
            }}
          />
        </div>

        <div className="relative z-10">
          {/* Date Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.08] border border-white/15 text-white/90 text-[10.5px] font-mono tracking-[0.16em] uppercase font-semibold mb-2.5 shadow-2xs backdrop-blur-xs">
            <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).toUpperCase()}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1
            style={{ fontFamily: "'Bebas Neue', 'Montserrat', sans-serif" }}
            className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-white leading-tight"
          >
            Categories Management ({categories.length})
          </h1>
          <p
            style={{ fontFamily: "'Montserrat', sans-serif" }}
            className="text-xs sm:text-sm text-white/70 mt-1 max-w-xl font-normal leading-relaxed"
          >
            Add new categories, edit category slugs, upload banners, and curate sacred collections.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white text-xs font-semibold flex items-center gap-2 transition-all no-underline shadow-2xs"
          >
            <i className="fa-solid fa-boxes-stacked text-xs text-white/80" />
            <span>View Products</span>
          </Link>

          <button
            type="button"
            onClick={openAddModal}
            style={{ backgroundColor: '#FFFFFF', color: '#111111' }}
            className="text-xs font-bold px-5 py-2.5 rounded-full hover:bg-gray-100 transition-all shadow-md cursor-pointer inline-flex items-center gap-2 text-black"
          >
            <i className="fa-solid fa-plus text-xs text-black" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-folder-tree" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">Total Categories</span>
            <span className="text-xl font-bold text-gray-900">{categories.length}</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-cube" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">Assigned Products</span>
            <span className="text-xl font-bold text-gray-900">{totalProducts}</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-compass" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">Store Navigation</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full inline-block mt-0.5">
              Synced Live
            </span>
          </div>
        </div>
      </div>

      {/* Search Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-3">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#3A1F62]"
          />
        </div>

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs text-gray-500 hover:text-gray-900 px-3 py-2 rounded-xl border border-gray-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Categories Table / Cards */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <i className="fa-solid fa-circle-notch fa-spin text-2xl text-[#3A1F62]" />
            <p className="text-xs text-gray-500">Loading categories from database...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto text-lg">
              <i className="fa-solid fa-folder-open" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No categories found</p>
            <p className="text-xs text-gray-400">
              {searchQuery ? 'Try clearing your search query.' : 'Click "Add New Category" above to create your first one.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Products</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredCategories.map((cat) => {
                  const imageSrc = cat.imageUrl || cat.image;
                  return (
                    <tr key={cat.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Name + Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            {imageSrc ? (
                              <img
                                src={imageSrc}
                                alt={cat.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-base bg-gray-100">
                                <i className="fa-solid fa-gem text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block text-sm">
                              {cat.name}
                            </span>
                            <span className="text-[11px] text-gray-400">ID: {cat.id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="py-3.5 px-4 text-xs font-mono text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded-md text-[11px]">
                          {cat.slug}
                        </span>
                      </td>

                      {/* Products Count */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            cat.productCount > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              cat.productCount > 0 ? 'bg-emerald-500' : 'bg-gray-400'
                            }`}
                          />
                          {cat.productCount} {cat.productCount === 1 ? 'item' : 'items'}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 text-xs text-gray-500 max-w-xs truncate">
                        {cat.description || <span className="text-gray-300 italic">No description</span>}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/products?q=${encodeURIComponent(cat.name)}`}
                            title="View Products in Category"
                            className="p-2 text-gray-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => openEditModal(cat)}
                            title="Edit Category"
                            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <i className="fa-solid fa-pen-to-square text-xs" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteModal(cat)}
                            title="Delete Category"
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <i className="fa-solid fa-trash-can text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT CATEGORY MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative space-y-4 my-8 sm:my-10">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center text-sm">
                  <i className={editingCategory ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-plus'} />
                </div>
                <h3 className="font-bold text-lg text-gray-900">
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incense & Singing Bowls"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  placeholder="e.g. incense-singing-bowls"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Used in URL: /shop?category={formSlug || 'category-slug'}
                </p>
              </div>

              {/* Image Upload Option */}
              <ImageUploadField
                label="Category Banner / Icon Image"
                value={formImage}
                onChange={setFormImage}
                helpText="Upload a category photo from your computer (PNG, JPG, or WEBP)."
              />

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of sacred items in this collection..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: '#111111', color: '#ffffff' }}
                  className="px-6 py-2.5 text-xs font-semibold rounded-full hover:bg-black transition-all shadow-xs cursor-pointer inline-flex items-center gap-2 disabled:opacity-50 text-white"
                >
                  {isSubmitting && <i className="fa-solid fa-spinner fa-spin" />}
                  <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xl mx-auto">
              <i className="fa-solid fa-triangle-exclamation" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-lg text-gray-900">Delete Category</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to delete <strong className="text-gray-900">{deleteConfirmCat.name}</strong>?
              </p>
            </div>

            {deleteConfirmCat.productCount > 0 ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <i className="fa-solid fa-triangle-exclamation text-amber-600 text-sm" />
                  <span>{deleteConfirmCat.productCount} active products in this category</span>
                </div>
                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                  To delete this category safely without losing items, select which category to move these <strong>{deleteConfirmCat.productCount} products</strong> to:
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    Reassign products to:
                  </label>
                  <select
                    value={reassignTargetId}
                    onChange={(e) => setReassignTargetId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-amber-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                  >
                    {categories
                      .filter((c) => c.id !== deleteConfirmCat.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.productCount} products)
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center">
                This category has 0 products and can be safely removed from your store.
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCat(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {deleteConfirmCat.productCount > 0 ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting || !reassignTargetId}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                >
                  {isSubmitting && <i className="fa-solid fa-spinner fa-spin" />}
                  <span>Move &amp; Delete</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                >
                  {isSubmitting && <i className="fa-solid fa-spinner fa-spin" />}
                  <span>Delete Category</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
