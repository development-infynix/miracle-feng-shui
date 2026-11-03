'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LuChevronLeft, LuChevronRight, LuPencil, LuTrash2, LuX } from 'react-icons/lu';
import { useStore } from '@/context/StoreContext';
import Alert from '@/app/components/alert';
import ItemDetailsField from './ItemDetailsField';

interface ViewProductDrawerProps {
  open: boolean;
  product: any;
  categories?: readonly string[];
  loading?: boolean;
  onClose: () => void;
  onSaved?: (updated?: any) => void;
  onDeleted?: () => void;
}

const inputClass =
  'w-full rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10';

export default function ViewProductDrawer({ open, product, categories, loading, onClose, onSaved, onDeleted }: ViewProductDrawerProps) {
  const { updateProduct, deleteProduct } = useStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<any>({});
  const [activeImage, setActiveImage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToImage = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const clamped = Math.max(0, Math.min(index, images.length - 1));
    container.scrollTo({ left: clamped * container.clientWidth, behavior: 'smooth' });
  };

  const handleSwipeScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    setActiveImage(Math.max(0, Math.min(index, images.length - 1)));
  };

  useEffect(() => {
    setEditing(false);
    setError('');
    setActiveImage(0);
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, [product?.id]);

  if (!open || !product) return null;

  const images: string[] = Array.isArray(product.images) && product.images.length > 0 ? product.images : [];
  const name = product.name || product.title || 'Untitled Product';

  const startEditing = () => {
    setForm({
      name: product.name || product.title || '',
      description: product.description || '',
      price: product.price ?? 0,
      originalPrice: product.originalPrice ?? '',
      discount: product.discount || '',
      stock: product.stock ?? 50,
      category: product.category || '',
      maker: product.maker || '',
      bestseller: !!product.bestseller,
      etsyPick: !!product.etsyPick,
      freeShipping: !!product.freeShipping,
      itemDetails: product.itemDetails || [],
    });
    setError('');
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setError('');
  };

  const handleDelete = async () => {
    if (!product?.id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}?hard=true`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || 'Failed to delete product.');
        setConfirmDelete(false);
        return;
      }
      deleteProduct(product.id); // sync local state
      setConfirmDelete(false);
      onClose();
      onDeleted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product.');
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const saveChanges = async () => {
    const title = String(form.name || '').trim();
    if (!title) {
      setError('Product title is required.');
      return;
    }
    const price = Number(form.price);
    if (!price || price <= 0) {
      setError('Enter a valid selling price.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const ok = await updateProduct(product.id, {
        name: title,
        description: String(form.description || '').trim(),
        price,
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        discount: String(form.discount || '').trim(),
        stock: Number(form.stock) || 0,
        category: form.category,
        itemDetails: (form.itemDetails || []).map((v: string) => v.trim()).filter(Boolean),
        materials: product.materials,
        maker: String(form.maker || '').trim(),
        bestseller: !!form.bestseller,
        etsyPick: !!form.etsyPick,
        freeShipping: !!form.freeShipping,
      });
      if (!ok) {
        setError('Failed to save changes. Check console/auth.');
        return;
      }
      try {
        const res = await fetch(`/api/admin/products/${product.id}/detail`);
        const json = await res.json();
        if (res.ok && json.success && json.data) onSaved?.(json.data);
        else onSaved?.();
      } catch {
        onSaved?.();
      }
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const badges = [
    product.bestseller ? 'Bestseller' : null,
    product.etsyPick ? 'Miracle Pick' : null,
    product.freeShipping ? 'Free Shipping' : null,
    product.isFeatured ? 'Featured' : null,
    product.isActive === false ? 'Inactive' : 'Active',
  ].filter(Boolean);

  const rows: Array<[string, React.ReactNode]> = editing
    ? []
    : [
        ['Category', product.category || '—'],
        ['Maker', product.maker || '—'],
        ['Rating', `${product.rating ?? product.ratingAvg ?? 5} ★  (${product.reviewCount ?? product.ratingCount ?? 0})`],
        ['Stock', `${product.stock ?? 50} in stock`],
        ['Free shipping', product.freeShipping ? 'Yes' : 'No'],
        ['Status', product.isActive === false ? 'Inactive' : 'Active'],
      ];

  const categoryOptions = (categories || []).filter((c) => c !== 'All');

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-details-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-[#fafaf9] shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-stone-200 px-6">
          <h2 id="product-details-title" className="text-xl font-bold text-stone-900">
            Product Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            <LuX className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-6">
              <div className="h-64 rounded-lg bg-stone-200/70 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-3/4 rounded bg-stone-200/70 animate-pulse" />
                <div className="h-4 w-full rounded bg-stone-200/70 animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-stone-200/70 animate-pulse" />
              </div>
              <div className="rounded-lg border border-stone-200 bg-white divide-y divide-stone-100">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-10 px-4 flex items-center">
                    <div className="h-3.5 w-24 rounded bg-stone-200/70 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {images.length > 0 && (
            <div className="rounded-lg overflow-hidden border border-stone-200 bg-white">
              <div className="relative group">
                <div
                  ref={scrollRef}
                  onScroll={handleSwipeScroll}
                  className="flex snap-x snap-mandatory overflow-x-auto [&::-webkit-scrollbar]:hidden"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {images.map((img: string, i: number) => (
                    <div key={i} className="w-full shrink-0 snap-center">
                      <img
                        src={img}
                        alt={`${name} ${i + 1}`}
                        className="w-full h-64 object-cover pointer-events-none select-none"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                    </div>
                  ))}
                </div>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={() => scrollToImage(activeImage - 1)}
                      className={`absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 border border-stone-200 text-stone-700 flex items-center justify-center shadow transition-opacity ${
                        activeImage === 0 ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <LuChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={() => scrollToImage(activeImage + 1)}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 border border-stone-200 text-stone-700 flex items-center justify-center shadow transition-opacity ${
                        activeImage === images.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <LuChevronRight className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                      {images.map((_: string, i: number) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`Go to image ${i + 1}`}
                          onClick={() => scrollToImage(i)}
                          className={`h-1.5 rounded-full transition-all ${
                            i === activeImage ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {editing && (
            <section>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5">Title</label>
              <input
                aria-label="Product title"
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <label className="block text-xs font-semibold text-stone-500 mb-1.5 mt-3">Description</label>
              <textarea
                aria-label="Product description"
                rows={5}
                className={inputClass}
                placeholder="Product description..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <div className="mt-3">
                <ItemDetailsField
                  value={form.itemDetails || []}
                  onChange={(itemDetails) => setForm({ ...form, itemDetails })}
                />
              </div>
            </section>
          )}

          {!editing && (
            <section>
              <h4 className="font-bold text-stone-900 text-lg leading-snug">{name}</h4>
              {product.description ? (
                <p className="text-sm leading-relaxed text-stone-700 whitespace-pre-wrap mt-2">
                  {product.description}
                </p>
              ) : (
                <p className="text-sm text-stone-400">No description.</p>
              )}
              <h5 className="text-xs font-semibold text-stone-500 mb-1.5 mt-4">Item Details</h5>
              {Array.isArray(product.itemDetails) && product.itemDetails.length > 0 ? (
                <ul className="list-disc space-y-1 rounded-lg border border-stone-200 bg-white px-8 py-3 text-sm text-stone-700">
                  {product.itemDetails.map((d: string, i: number) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-stone-400">No item details.</p>
              )}
            </section>
          )}

          {badges.length > 0 && !editing && (
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-semibold text-stone-700"
                >
                  {b}
                </span>
              ))}
            </div>
          )}

          <section>
            <dl className="divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white px-4">
              <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                <dt className="text-stone-500">Price</dt>
                <dd className="font-semibold text-stone-900">
                  {editing ? (
                    <input
                      aria-label="Selling price"
                      type="number"
                      min={1}
                      className={inputClass}
                      value={form.price || ''}
                      onChange={(e) => setForm({ ...form, price: e.target.value === '' ? 0 : Number(e.target.value) })}
                    />
                  ) : (
                    `₹${product.price}`
                  )}
                </dd>
              </div>
              {editing || product.originalPrice ? (
                <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                  <dt className="text-stone-500">Original price</dt>
                  <dd>
                    {editing ? (
                      <input
                        aria-label="Original price"
                        type="number"
                        min={1}
                        className={inputClass}
                        value={form.originalPrice || ''}
                        onChange={(e) =>
                          setForm({ ...form, originalPrice: e.target.value === '' ? '' : Number(e.target.value) })
                        }
                      />
                    ) : (
                      <span className="text-stone-400 line-through">₹{product.originalPrice}</span>
                    )}
                  </dd>
                </div>
              ) : null}
              {editing || product.discount ? (
                <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                  <dt className="text-stone-500">Discount</dt>
                  <dd>
                    {editing ? (
                      <input
                        aria-label="Discount label"
                        placeholder="e.g. 33% off"
                        className={inputClass}
                        value={form.discount}
                        onChange={(e) => setForm({ ...form, discount: e.target.value })}
                      />
                    ) : (
                      <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                        {product.discount}
                      </span>
                    )}
                  </dd>
                </div>
              ) : null}
              <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                <dt className="text-stone-500">Category</dt>
                <dd className="font-medium text-stone-900">
                  {editing ? (
                    categoryOptions.length > 0 ? (
                      <select
                        aria-label="Category"
                        className={`${inputClass} bg-white`}
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                      >
                        {categoryOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        aria-label="Category"
                        className={inputClass}
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                      />
                    )
                  ) : (
                    product.category || '—'
                  )}
                </dd>
              </div>
              <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                <dt className="text-stone-500">Maker</dt>
                <dd className="font-medium text-stone-900">
                  {editing ? (
                    <input
                      aria-label="Maker"
                      className={inputClass}
                      value={form.maker}
                      onChange={(e) => setForm({ ...form, maker: e.target.value })}
                    />
                  ) : (
                    product.maker || '—'
                  )}
                </dd>
              </div>
              <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                <dt className="text-stone-500">Stock</dt>
                <dd className="font-medium text-stone-900">
                  {editing ? (
                    <input
                      aria-label="Stock level"
                      type="number"
                      min={0}
                      className={inputClass}
                      value={form.stock}
                      onChange={(e) =>
                        setForm({ ...form, stock: e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0) })
                      }
                    />
                  ) : (
                    `${product.stock ?? 50} in stock`
                  )}
                </dd>
              </div>
              {!editing && (
                <>
                  <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                    <dt className="text-stone-500">Rating</dt>
                    <dd className="font-medium text-stone-900">
                      {product.rating ?? product.ratingAvg ?? 5} ★  ({product.reviewCount ?? product.ratingCount ?? 0})
                    </dd>
                  </div>
                  <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                    <dt className="text-stone-500">Free shipping</dt>
                    <dd className="font-medium text-stone-900">{product.freeShipping ? 'Yes' : 'No'}</dd>
                  </div>
                  <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                    <dt className="text-stone-500">Status</dt>
                    <dd className="font-medium text-stone-900">
                      {product.isActive === false ? 'Inactive' : 'Active'}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </section>

          {editing && (
            <section>
              <div className="flex flex-wrap gap-4">
                {[
                  ['bestseller', 'Bestseller'],
                  ['etsyPick', 'Miracle Pick'],
                  ['freeShipping', 'Free Shipping'],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-xs font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={!!form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                      className="h-4 w-4 rounded-md border-stone-300 text-stone-900 focus:ring-stone-900"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {error && (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {!editing && (
            <>
              {Array.isArray(product.materials) && product.materials.length > 0 && (
                <section>
                  <div className="flex flex-wrap gap-2">
                    {product.materials.map((m: string, i: number) => (
                      <span
                        key={i}
                        className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-xs text-stone-700"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {Array.isArray(product.tags) && product.tags.length > 0 && (
                <section>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((t: string, i: number) => (
                      <span
                        key={i}
                        className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-xs text-stone-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
            </>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-stone-200 bg-[#fafaf9] px-5 py-4">
          {editing ? (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="inline-flex h-10 items-center justify-center rounded-md border border-stone-300 px-4 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveChanges}
                disabled={saving}
                className="inline-flex h-10 items-center justify-center rounded-md bg-stone-900 px-5 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                aria-label={`Edit ${name}`}
                title="Edit product"
                onClick={startEditing}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-stone-900 text-white transition-colors hover:bg-stone-700"
              >
                <LuPencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={`Delete ${name}`}
                title="Delete product"
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
          title="Delete this product?"
          description={`"${name}" will be permanently removed from the catalog. This action cannot be undone.`}
          onClose={() => setConfirmDelete(false)}
          actions={[
            {
              label: 'Cancel',
              onClick: () => setConfirmDelete(false),
              variant: 'default',
              disabled: deleting,
            },
            {
              label: deleting ? 'Deleting...' : 'Delete',
              onClick: handleDelete,
              variant: 'danger',
              disabled: deleting,
            },
          ]}
        />
      </aside>
    </div>
  );
}
