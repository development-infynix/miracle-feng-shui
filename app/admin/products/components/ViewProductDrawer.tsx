'use client';

import React, { useEffect, useState } from 'react';
import { LuChevronLeft, LuChevronRight, LuPencil, LuTrash2, LuX } from 'react-icons/lu';
import { useStore } from '@/context/StoreContext';
import ItemDetailsField from './ItemDetailsField';

interface ViewProductDrawerProps {
  open: boolean;
  product: any;
  categories?: readonly string[];
  loading?: boolean;
  onClose: () => void;
  onSaved?: (updated?: any) => void;
  onDeleted?: (updated?: any) => void;
}

const inputClass = 'w-full rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10';

export default function ViewProductDrawer({ open, product, categories, loading, onClose, onSaved, onDeleted }: ViewProductDrawerProps) {
  const { updateProduct, refreshProducts } = useStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<any>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setEditing(false);
    setError('');
    setActiveImage(0);
  }, [product?.id]);

  if (!open || !product) return null;

  const name = product.name || product.title || 'Untitled Product';
  const images: string[] = Array.isArray(product.images) && product.images.length > 0 ? product.images : [];
  const badges = [
    product.bestseller ? 'Bestseller' : null,
    product.etsyPick ? 'Miracle Pick' : null,
    product.freeShipping ? 'Free Shipping' : null,
    product.isFeatured ? 'Featured' : null,
    product.isActive === false ? 'Inactive' : 'Active',
  ].filter(Boolean);

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
      rating: product.rating ?? product.ratingAvg ?? 0,
      bestseller: !!product.bestseller,
      etsyPick: !!product.etsyPick,
      freeShipping: !!product.freeShipping,
      itemDetails: product.itemDetails || [],
      isActive: product.isActive !== false,
    });
    setEditing(true);
  };

  const saveChanges = async () => {
    const title = String(form.name || '').trim();
    if (!title) { setError('Product title is required.'); return; }
    const price = Number(form.price);
    if (!price || price <= 0) { setError('Enter a valid selling price.'); return; }
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
        isActive: !!form.isActive,
        maker: String(form.maker || '').trim(),
        rating: form.rating,
        bestseller: !!form.bestseller,
        etsyPick: !!form.etsyPick,
        freeShipping: !!form.freeShipping,
      });
      if (!ok) { setError('Failed to save changes.'); return; }
      try {
        const res = await fetch(`/api/admin/products/${product.id}/detail`);
        const json = await res.json();
        if (res.ok && json.success && json.data) onSaved?.(json.data); else onSaved?.();
      } catch { onSaved?.(); }
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // The product's orders decide what removing it does (see adminService.deleteProduct).
  const removal: { mode: 'blocked' | 'archive' | 'delete'; openOrders: number } | undefined = product?.removal;
  const archived = product?.isActive === false;
  const blockedReason =
    removal?.mode === 'blocked'
      ? `In ${removal.openOrders === 1 ? '1 open order' : `${removal.openOrders} open orders`}. It can be removed once they're delivered, or cancelled with any refund processed.`
      : '';

  const handleDelete = async () => {
    if (!product?.id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data?.error || 'Failed to remove product.'); setConfirmDelete(false); return; }
      refreshProducts();
      setConfirmDelete(false);
      if (data?.data?.result === 'archived') {
        // Archived products stay in the admin list, hidden from the store, so show the updated record.
        try {
          const detail = await fetch(`/api/admin/products/${product.id}/detail`).then((r) => r.json());
          onSaved?.(detail?.success ? detail.data : undefined);
        } catch { onSaved?.(); }
        return;
      }
      onClose(); onDeleted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product.');
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const ratingValue = (product.rating ?? product.ratingAvg ?? 0);
  const scrollToImage = (index: number) => {
    const clamped = Math.max(0, Math.min(index, images.length - 1));
    setActiveImage(clamped);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-[#fafaf9] shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-stone-200 px-6">
          <h2 className="text-xl font-bold text-stone-900">Product Details</h2>
          <button type="button" onClick={onClose} aria-label="Close product details" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors">
            <LuX className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-6">
              <div className="h-64 rounded-lg bg-stone-200/70 animate-pulse" />
            </div>
          ) : (
            <>
              {images.length > 0 && (
                <div className="rounded-lg overflow-hidden border border-stone-200 bg-white">
                  <div className="relative group">
                    <div className="flex snap-x snap-mandatory overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {images.map((img: string, i: number) => (
                        <div key={i} className="w-full shrink-0 snap-center" style={{ display: i === activeImage ? 'block' : 'none' }}>
                          <img
                            src={img}
                            alt={`${name} ${i + 1}`}
                            className="w-full h-64 object-cover pointer-events-none select-none"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    {images.length > 1 && (
                      <>
                        <button type="button" aria-label="Previous image" onClick={() => scrollToImage(activeImage - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 border border-stone-200 text-stone-700 flex items-center justify-center shadow transition-opacity hover:opacity-100">
                          <LuChevronLeft className="h-4 w-4" />
                        </button>
                        <button type="button" aria-label="Next image" onClick={() => scrollToImage(activeImage + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 border border-stone-200 text-stone-700 flex items-center justify-center shadow transition-opacity hover:opacity-100">
                          <LuChevronRight className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                          {images.map((_: string, i: number) => (
                            <button key={i} type="button" aria-label={`Go to image ${i + 1}`} onClick={() => scrollToImage(i)} className={`h-1.5 rounded-full transition-all ${i === activeImage ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {!editing && (
                <section>
                  <h4 className="font-bold text-stone-900 text-lg leading-snug">{name}</h4>
                  {product.description ? (
                    <p className="text-sm leading-relaxed text-stone-700 whitespace-pre-wrap mt-2">{product.description}</p>
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
                    <span key={b} className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-semibold text-stone-700">
                      {b}
                    </span>
                  ))}
                </div>
              )}

              <section>
                <dl className="divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white px-4">
                  {editing ? (
                    <>
                      <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                        <dt className="text-stone-500">Title</dt>
                        <dd><input aria-label="Product title" className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></dd>
                      </div>
                      <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                        <dt className="text-stone-500">Description</dt>
                        <dd><textarea aria-label="Product description" rows={4} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></dd>
                      </div>
                      <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                        <dt className="text-stone-500">Price</dt>
                        <dd><input aria-label="Selling price" type="number" min={1} className={inputClass} value={form.price || ''} onChange={(e) => setForm({ ...form, price: e.target.value === '' ? 0 : Number(e.target.value) })} /></dd>
                      </div>
                      <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                        <dt className="text-stone-500">Original price</dt>
                        <dd><input aria-label="Original price" type="number" min={1} className={inputClass} value={form.originalPrice || ''} onChange={(e) => setForm({ ...form, originalPrice: e.target.value === '' ? '' : Number(e.target.value) })} /></dd>
                      </div>
                      <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                        <dt className="text-stone-500">Discount</dt>
                        <dd><input aria-label="Discount label" className={inputClass} value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} /></dd>
                      </div>
                      <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                        <dt className="text-stone-500">Category</dt>
                        <dd>
                          {(categories || []).filter((c) => c !== 'All').length > 0 ? (
                            <select aria-label="Category" className={`${inputClass} bg-white`} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                              {(categories || []).filter((c) => c !== 'All').map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          ) : (
                            <input aria-label="Category" className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                          )}
                        </dd>
                      </div>
                      <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                        <dt className="text-stone-500">Maker</dt>
                        <dd><input aria-label="Maker" className={inputClass} value={form.maker} onChange={(e) => setForm({ ...form, maker: e.target.value })} /></dd>
                      </div>
                      <div className="py-3 text-sm">
                        <ItemDetailsField value={form.itemDetails || []} onChange={(itemDetails) => setForm({ ...form, itemDetails })} />
                      </div>
                      <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                        <dt className="text-stone-500">Rating</dt>
                        <dd><input aria-label="Product rating" type="number" min={0} max={5} step={0.1} className={inputClass} value={form.rating != null && form.rating > 0 ? form.rating : ''} onChange={(e) => setForm({ ...form, rating: e.target.value === '' ? 0 : Math.max(0, Math.min(5, Number(e.target.value))) })} /></dd>
                      </div>
                      <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                        <dt className="text-stone-500">Stock</dt>
                        <dd><input aria-label="Stock level" type="number" min={0} className={inputClass} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0) })} /></dd>
                      </div>
                      <div className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                        <dt className="text-stone-500">Status</dt>
                        <dd className="flex items-center gap-3">
                          <button type="button" role="switch" aria-checked={!!form.isActive} aria-label="Product active" onClick={() => setForm({ ...form, isActive: !form.isActive })} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 ${form.isActive ? 'bg-stone-900' : 'bg-stone-300'}`}>
                            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                          <span className="text-xs text-stone-600">{form.isActive ? 'Active: visible in the store' : 'Inactive: hidden from the store'}</span>
                        </dd>
                      </div>
                      <div className="flex flex-wrap gap-4 py-3">
                        {[
                          ['bestseller', 'Bestseller'],
                          ['etsyPick', 'Miracle Pick'],
                          ['freeShipping', 'Free Shipping'],
                        ].map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 text-xs font-medium text-stone-700">
                            <input type="checkbox" checked={!!form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} className="h-4 w-4 rounded-md border-stone-300 text-stone-900 focus:ring-stone-900" />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                    </>
                  ) : (
                    [
                      ['Category', product.category || '-'],
                      ['Maker', product.maker || '-'],
                      ['Rating', ratingValue > 0 ? ratingValue + ' stars' : 'No rating yet'],
                      ['Reviews', String(product.reviewCount ?? 0)],
                      ['Stock', `${product.stock ?? 50} in stock`],
                      ['Free shipping', product.freeShipping ? 'Yes' : 'No'],
                      ['Status', product.isActive === false ? 'Inactive' : 'Active'],
                    ].map(([label, value]) => (
                      <div key={label} className="grid grid-cols-[7rem_1fr] items-center gap-3 py-3 text-sm">
                        <dt className="text-stone-500">{label}</dt>
                        <dd className="font-medium text-stone-900">{value}</dd>
                      </div>
                    ))
                  )}
                </dl>
              </section>

              {error && (
                <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
            </>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-stone-200 bg-[#fafaf9] px-5 py-4">
          {editing ? (
            <>
              <button type="button" onClick={() => setEditing(false)} disabled={saving} className="inline-flex h-10 items-center justify-center rounded-md border border-stone-300 px-4 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 disabled:opacity-50">
                Cancel
              </button>
              <button type="button" onClick={saveChanges} disabled={saving} className="inline-flex h-10 items-center justify-center rounded-md bg-stone-900 px-5 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button type="button" aria-label={`Edit ${name}`} title="Edit product" onClick={startEditing} className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-stone-900 text-white transition-colors hover:bg-stone-700">
                <LuPencil className="h-4 w-4" />
              </button>
              {removal?.mode === 'blocked' ? (
                <span className="flex items-center gap-3">
                  <span className="max-w-[16rem] text-right text-xs text-stone-500">{blockedReason}</span>
                  <button type="button" disabled aria-label={`Delete ${name}: ${blockedReason}`} title={blockedReason} className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-md bg-stone-200 px-4 text-sm font-medium text-stone-500">
                    <LuTrash2 className="h-4 w-4" />
                    Delete
                  </button>
                </span>
              ) : removal?.mode === 'archive' && archived ? (
                <span className="text-xs text-stone-500">Archived: hidden from the store, kept in past orders.</span>
              ) : removal?.mode === 'archive' ? (
                <button type="button" aria-label={`Archive ${name}`} title="It's in past orders, so it can be archived but not deleted" onClick={() => setConfirmDelete(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-600 px-4 text-sm font-medium text-red-700 transition-colors hover:bg-red-50">
                  <LuTrash2 className="h-4 w-4" />
                  Archive
                </button>
              ) : (
                <button type="button" aria-label={`Delete ${name}`} title="Delete product" onClick={() => setConfirmDelete(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700">
                  <LuTrash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
            </>
          )}
        </footer>

        {confirmDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
            <div className="bg-white p-4 rounded-md shadow">
              {removal?.mode === 'archive' ? (
                <>
                  <p className="text-sm font-medium text-stone-900">Archive {name}?</p>
                  <p className="mt-1 mb-3 max-w-sm text-sm text-stone-600">It&apos;s in past orders, so it can&apos;t be deleted. Archiving hides it from the store and keeps it in those orders and their invoices. You can make it active again later.</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-stone-900">Delete {name}?</p>
                  <p className="mt-1 mb-3 max-w-sm text-sm text-stone-600">It isn&apos;t in any order, so it will be removed for good, along with it in any carts and favorites.</p>
                </>
              )}
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 text-sm border rounded">Cancel</button>
                <button type="button" onClick={handleDelete} disabled={deleting} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded">
                  {removal?.mode === 'archive' ? (deleting ? 'Archiving...' : 'Archive') : deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
