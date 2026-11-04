'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { IoFunnelSharp } from 'react-icons/io5';
import { BsInfoSquareFill } from 'react-icons/bs';
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { Product, categories } from '@/lib/placeholder-data';
import ImageUploadField from '@/components/admin/ImageUploadField';
import AddProductDrawer from './components/AddProductDrawer';
import ProductCard from './components/ProductCard';
import ViewProductDrawer from './components/ViewProductDrawer';
import EditProductDrawer from './components/EditProductDrawer';



interface ProductsClientProps {
  initialProducts: Product[];
  total: number;
  search?: string;
  category?: string;
  page: number;
  pageSize: number;
  totalPages: number;
  categories?: string[];
  stockStats: { total: number; healthy: number; low: number; outOfStock: number };
}

export default function ProductsClient({
  initialProducts,
  total,
  page,
  search: searchProp,
  category: serverCategory,
  totalPages,
  categories: serverCategories,
  stockStats,
}: ProductsClientProps) {
  const router = useRouter();
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const {
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    categories: storeCategories,
  } = useStore();
  const availableCategories = serverCategories && serverCategories.length > 0 ? serverCategories : (storeCategories && storeCategories.length > 0 ? storeCategories : categories);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    setProducts(initialProducts);
    setIsNavigating(false);
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [initialProducts]);

  const [searchQuery, setSearchQuery] = useState(searchProp || '');
  const [selectedCategory, setSelectedCategory] = useState(serverCategory || 'All');
  const urlSearch = searchProp || '';
  const urlCategory = serverCategory || 'All';

  // The URL is the source of truth, so a sidebar link or the back button also updates the controls.
  useEffect(() => {
    setSearchQuery(urlSearch);
    setSelectedCategory(urlCategory);
  }, [urlSearch, urlCategory]);

  const productsUrl = (nextPage: number, nextSearch: string, nextCategory: string) => {
    const params = new URLSearchParams({ page: String(nextPage) });
    if (nextSearch) params.set('q', nextSearch);
    if (nextCategory !== 'All') params.set('category', nextCategory);
    return '/admin/products?' + params.toString();
  };

  // Only navigate when the controls differ from the URL, so a page load keeps its page number.
  useEffect(() => {
    const term = searchQuery.trim();
    if (term === urlSearch && selectedCategory === urlCategory) return;
    const t = setTimeout(() => {
      setIsNavigating(true);
      router.replace(productsUrl(1, term, selectedCategory));
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery, selectedCategory, urlSearch, urlCategory, router]);

  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const openViewDetail = async (prod: Product) => {
    setViewProduct(prod); // open instantly with card data
    setViewLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${prod.id}/detail`);
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setViewProduct(json.data);
      } else {
        console.error('Failed to load product detail:', res.status, json);
      }
    } catch (e) {
      console.error('Failed to load product detail:', e);
    } finally {
      setViewLoading(false);
    }
  };
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // CSV Export & Import States
  const [isExporting, setIsExporting] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<Array<{
    title: string;
    category: string;
    price: string;
    stock: string;
    isValid: boolean;
    error?: string;
  }>>([]);
  const [updateExistingOnImport, setUpdateExistingOnImport] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState<{
    totalProcessed: number;
    createdCount: number;
    updatedCount: number;
    errors: Array<{ row: number; title?: string; message: string }>;
  } | null>(null);

  // Clean Form State for Adding New Products
  const emptyProductForm: Omit<Product, 'id'> = {
    name: '',
    maker: 'Miracle Feng Shui Studio',
    price: 0,
    originalPrice: undefined,
    discount: '',
    stock: undefined,
    bestseller: false,
    etsyPick: false,
    freeShipping: true,
    rating: 0,
    reviewCount: 0,
    category: '',
    images: [],
    description: '',
    itemDetails: [],
  };

  const [selectedStockFilter, setSelectedStockFilter] = useState<'All' | 'Low' | 'OutOfStock' | 'InStock'>('All');
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(emptyProductForm);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to upload image');
      }

      setFormData((prev) => ({
        ...prev,
        images: [result.data.url, ...(prev.images || []).slice(1)],
      }));
      showToast('Image uploaded successfully!');
    } catch (err: any) {
      showToast(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/admin/products/export');
      if (!res.ok) throw new Error('Failed to download CSV');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `miracle-feng-shui-products-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Catalog exported to CSV successfully!');
    } catch (err: any) {
      showToast(err.message || 'CSV export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    setImportStats(null);

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        showToast('CSV file is empty or only has headers');
        return;
      }

      // Quick preview parser for the first 8 rows
      const parsed: Array<{
        title: string;
        category: string;
        price: string;
        stock: string;
        isValid: boolean;
        error?: string;
      }> = [];

      const headerLine = lines[0].toLowerCase();
      const headers = headerLine.split(',').map((h) => h.replace(/["']/g, '').trim());
      const titleIdx = headers.findIndex((h) => h === 'title' || h === 'name');
      const catIdx = headers.findIndex((h) => h === 'category');
      const priceIdx = headers.findIndex((h) => h === 'price');
      const stockIdx = headers.findIndex((h) => h === 'stock');

      for (let i = 1; i < Math.min(lines.length, 9); i++) {
        const rowText = lines[i];
        const matches = rowText.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || rowText.split(',');
        const cleanValues = matches.map((m) => m.replace(/^"|"$/g, '').trim());

        const title = titleIdx !== -1 ? cleanValues[titleIdx] : cleanValues[1] || cleanValues[0];
        const category = catIdx !== -1 ? cleanValues[catIdx] : cleanValues[2] || 'Feng Shui Decor';
        const price = priceIdx !== -1 ? cleanValues[priceIdx] : cleanValues[3] || '';
        const stock = stockIdx !== -1 ? cleanValues[stockIdx] : cleanValues[5] || '50';

        const numPrice = parseFloat(price);
        const isValid = Boolean(title && !isNaN(numPrice) && numPrice > 0);
        const error = !title
          ? 'Missing title'
          : isNaN(numPrice) || numPrice <= 0
          ? 'Invalid price'
          : undefined;

        parsed.push({
          title: title || 'Untitled',
          category: category || 'Feng Shui Decor',
          price: price || '0',
          stock: stock || '50',
          isValid,
          error,
        });
      }

      setPreviewRows(parsed);
    } catch {
      showToast('Error parsing preview from CSV file');
    }
  };

  const handleRunImport = async () => {
    if (!csvFile) {
      showToast('Please choose a CSV file first');
      return;
    }

    setIsImporting(true);
    setImportStats(null);
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('updateExisting', updateExistingOnImport ? 'true' : 'false');

      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to import CSV');
      }

      setImportStats(result.data);
      await refreshProducts();
      showToast(`Import finished! ${result.data.createdCount} created, ${result.data.updatedCount} updated.`);
    } catch (err: any) {
      showToast(err.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    // Default to a category that really exists, so the form can't submit a deleted one.
    setFormData({
      ...emptyProductForm,
      category: [...availableCategories].find((c) => c !== 'All') || '',
    });
    setModalOpen(true);
  };

  const openImportModal = () => {
    setImportModalOpen(true);
    setCsvFile(null);
    setPreviewRows([]);
    setImportStats(null);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      maker: prod.maker || 'Miracle Feng Shui Studio',
      price: prod.price,
      originalPrice: prod.originalPrice || undefined,
      discount: prod.discount || '',
      stock: prod.stock !== undefined ? prod.stock : 50,
      bestseller: !!prod.bestseller,
      etsyPick: !!prod.etsyPick,
      freeShipping: !!prod.freeShipping,
      rating: prod.rating ?? 0,
      reviewCount: prod.reviewCount ?? 0,
      category: prod.category || 'Feng Shui Decor',
      images: prod.images?.length ? prod.images : [],
      description: prod.description || '',
      itemDetails: prod.itemDetails?.length ? prod.itemDetails : [],
      materials: prod.materials?.length ? prod.materials : [],
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter a product title');
      return;
    }
    if (!formData.price || formData.price <= 0) {
      showToast('Please enter a valid selling price');
      return;
    }

    setIsSubmitting(true);
    setIsNavigating(true);
    try {
    const payload: Omit<Product, 'id'> = {
      ...formData,
      name: formData.name.trim(),
      maker: formData.maker.trim() || 'Miracle Feng Shui Studio',
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      discount: formData.discount ? formData.discount.trim() : '',
      stock: formData.stock !== undefined ? Number(formData.stock) : 50,
      images: formData.images && formData.images.length > 0 ? formData.images : ['/images/miracle.jpeg'],
      description: formData.description ? formData.description.trim() : '',
      itemDetails: (formData.itemDetails || []).map((v) => v.trim()).filter(Boolean),
    };

    if (editingProduct) {
      const ok = await updateProduct(editingProduct.id, payload);
      if (!ok) {
        showToast('Failed to update product in database. Check console/auth.');
        setIsNavigating(false);
        return;
      }
      setProducts((prev) =>
        prev.map((prod) =>
          prod.id === editingProduct.id
            ? {
                ...prod,
                name: payload.name,
                title: payload.name,
                price: payload.price,
                originalPrice: payload.originalPrice,
                stock: payload.stock,
                description: payload.description,
                images: payload.images,
                category: payload.category ?? prod.category,
                discount: payload.discount,
                bestseller: payload.bestseller,
                etsyPick: payload.etsyPick,
              }
            : prod
        )
      );
      showToast('Product updated successfully!');
      setModalOpen(false);
    } else {
      const ok = await addProduct(payload);
      if (ok) {
        showToast('New product added to catalog!');
        setModalOpen(false);
        router.refresh();
        setTimeout(() => setIsNavigating(false), 600);
      } else {
        showToast('Failed to save product to database. Check console/auth.');
        setIsNavigating(false);
      }
    }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setIsNavigating(true);
    deleteProduct(id);
    showToast('Product deleted from catalog.');
    router.refresh();
    setTimeout(() => setIsNavigating(false), 600);
  };

  // Filter products by category, search query, and stock level
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const stockVal = p.stock !== undefined ? p.stock : 50;
      let matchesStock = true;
      if (selectedStockFilter === 'Low') {
        matchesStock = stockVal > 0 && stockVal < 10;
      } else if (selectedStockFilter === 'OutOfStock') {
        matchesStock = stockVal === 0;
      } else if (selectedStockFilter === 'InStock') {
        matchesStock = stockVal >= 10;
      }

      return matchesStock;
    });
  }, [products, selectedStockFilter]);

  return (
    <div
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      className="flex flex-col gap-4 h-screen overflow-hidden -mx-3 -my-5 sm:-mx-4 lg:-mx-5"
    >
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20">
          <i className="fa-solid fa-circle-check text-emerald-400 text-base" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Luxury Noir Salon-Style Hero Page Banner with Right-Side Fade Image */}
      {/* Compact Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 relative z-10 px-4 py-2 bg-white">
        <div className="relative flex-1 min-w-0 sm:w-64 sm:flex-none sm:min-w-[16rem] mr-auto">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-hidden focus:border-black focus:ring-2 focus:ring-black/5 placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <i className="fa-solid fa-xmark text-xs" />
            </button>
          )}
        </div>

        {selectedCategory !== 'All' && (
          <div className="inline-flex h-9 max-w-[14rem] items-center gap-2 rounded-lg border border-gray-300 bg-white pl-3 pr-1 text-xs font-semibold text-gray-800">
            <span className="truncate" title={selectedCategory}>{selectedCategory}</span>
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              aria-label={`Clear category filter: ${selectedCategory}`}
              title="Clear category filter"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-xs" />
            </button>
          </div>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => { setCategoryMenuOpen((v) => !v); setInfoOpen(false); }}
            title="Filter by category"
            className="w-9 h-9 rounded-lg bg-[#040404] text-white hover:bg-black cursor-pointer flex items-center justify-center shadow-2xs"
          >
            <IoFunnelSharp className="text-sm" />
          </button>
          {categoryMenuOpen && (
            <div className="absolute right-0 top-full mt-2 z-[1000] w-44 rounded-lg border border-gray-200 bg-white shadow-xl overflow-y-auto max-h-60 [scrollbar-width:thin] [scrollbar-color:#d6d3d1_transparent]">
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCategoryMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-xs font-semibold flex items-center gap-2 cursor-pointer hover:bg-gray-100 ${
                    selectedCategory === cat ? 'bg-gray-100 text-black' : 'text-gray-700'
                  } ${cat === 'All' ? 'border-b border-gray-100' : ''}`}
                >
                  <span>{cat === 'All' ? 'All Categories' : cat}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => { setCategoryMenuOpen(false); setInfoOpen(false); openAddModal(); }}
            style={{ backgroundColor: '#040404', color: '#ffffff' }}
            className="text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-md hover:bg-black cursor-pointer inline-flex items-center gap-2 h-9"
          >
            <i className="fa-solid fa-plus text-xs" />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => { setInfoOpen((v) => !v); setCategoryMenuOpen(false); }}
            title="Catalog stats"
            className="w-9 h-9 rounded-lg bg-[#040404] text-white hover:bg-black cursor-pointer flex items-center justify-center shadow-2xs"
          >
            <BsInfoSquareFill className="text-sm" />
          </button>
          {infoOpen && (
            <div className="absolute right-0 top-full mt-2 z-[1000] w-56 rounded-lg border border-gray-200 bg-white shadow-xl p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Total Catalog</span>
                <span className="font-bold text-gray-900">{stockStats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Healthy Stock (&gt;=10)</span>
                <span className="font-bold text-emerald-700">{stockStats.healthy}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Low Stock (&lt;10)</span>
                <span className="font-bold text-gray-700">{stockStats.low}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Out of Stock (0)</span>
                <span className="font-bold text-rose-700">{stockStats.outOfStock}</span>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Products Table */}
      <div ref={listRef} className="relative flex-1 min-h-0 overflow-y-auto scroll-smooth px-4 py-2">
        {isNavigating && (
          <div className="absolute inset-0 z-40 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-700" />
          </div>
        )}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm shadow-2xs">
            No products found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onView={openViewDetail}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-0 py-3 border-t border-gray-100 bg-white mt-auto shrink-0">
          <div className="flex items-center justify-between w-full px-4">
          <span className="text-xs text-gray-500">Page {page} of {Math.max(1, totalPages)} · {total} items</span>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link href={productsUrl(page - 1, urlSearch, urlCategory)} onClick={() => setIsNavigating(true)} className="px-3 py-1.5 text-xs font-semibold rounded-md border bg-white text-gray-700 border-gray-200 hover:bg-gray-100 inline-flex items-center">
                <MdKeyboardDoubleArrowLeft className="mr-1 text-[15px]" />
                Prev
              </Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold rounded-md border bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed inline-flex items-center">
                <MdKeyboardDoubleArrowLeft className="mr-1 text-[15px]" />
                Prev
              </span>
            )}
            {page < Math.max(1, totalPages) ? (
              <Link href={productsUrl(page + 1, urlSearch, urlCategory)} onClick={() => setIsNavigating(true)} className="px-3 py-1.5 text-xs font-semibold rounded-md border bg-[#040404] text-white border-[#040404] hover:bg-black inline-flex items-center" style={{ color: "#ffffff" }}>
                Next
                <MdKeyboardDoubleArrowRight className="ml-1 text-[15px]" />
              </Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold rounded-md border bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed inline-flex items-center">
                Next
                <MdKeyboardDoubleArrowRight className="ml-1 text-[15px]" />
              </span>
            )}
          </div>
        </div>
      </div>

            {editingProduct ? (
        <EditProductDrawer
          open={modalOpen}
          editingProduct={editingProduct}
          formData={formData}
          setFormData={setFormData}
          availableCategories={availableCategories}
          isUploading={isUploading}
          onImageFileUpload={handleImageFileUpload}
          onClose={() => setModalOpen(false)}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
        />
      ) : (
        <AddProductDrawer
          open={modalOpen}
          editingProduct={editingProduct}
          formData={formData}
          setFormData={setFormData}
          availableCategories={availableCategories}
          isUploading={isUploading}
          onImageFileUpload={handleImageFileUpload}
          onClose={() => setModalOpen(false)}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-gray-100 flex flex-col gap-4 my-8 sm:my-10">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg border border-emerald-200/50">
                  <i className="fa-solid fa-file-csv" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base sm:text-lg">
                    Bulk Product CSV Import
                  </h2>
                  <p className="text-xs text-gray-500">
                    Upload a CSV file to add or update multiple catalog products at once.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            {/* Template Advice Card */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 text-xs text-emerald-900">
                <i className="fa-solid fa-circle-info text-emerald-600 text-sm" />
                <span>
                  Make sure your CSV contains columns like <strong>title</strong>, <strong>price</strong>, <strong>category</strong>, and <strong>stock</strong>.
                </span>
              </div>
              <a
                href="/api/admin/products/sample-csv"
                download="miracle-feng-shui-sample-template.csv"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-white hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300 shadow-2xs shrink-0 no-underline cursor-pointer"
              >
                <i className="fa-solid fa-download text-emerald-600" />
                <span>Download Sample CSV</span>
              </a>
            </div>

            {/* Drag and Drop Zone */}
            <div className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-6 sm:p-8 text-center transition-all bg-gray-50/50 relative">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shadow-2xs">
                  <i className="fa-solid fa-cloud-arrow-up" />
                </div>
                {csvFile ? (
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-gray-900">{csvFile.name}</span>
                    <span className="text-xs text-gray-500">
                      {(csvFile.size / 1024).toFixed(1)} KB • Click or drag another file to replace
                    </span>
                  </div>
                ) : (
                  <>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800">
                      Click to choose CSV or drag &amp; drop file here
                    </p>
                    <span className="text-[11px] text-gray-500">
                      Supports comma-separated values (.csv) with standard headers
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Parsed Rows Preview */}
            {previewRows.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-700">
                    Preview (First {previewRows.length} rows detected)
                  </span>
                  <span className="text-gray-500">
                    {previewRows.filter((r) => r.isValid).length} ready to import
                  </span>
                </div>
                <div className="max-h-44 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-100/70 text-gray-600 sticky top-0">
                      <tr>
                        <th className="p-2 font-semibold">Title</th>
                        <th className="p-2 font-semibold">Category</th>
                        <th className="p-2 font-semibold">Price</th>
                        <th className="p-2 font-semibold">Stock</th>
                        <th className="p-2 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-800">
                      {previewRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/80">
                          <td className="p-2 font-medium truncate max-w-[180px]" title={row.title}>
                            {row.title}
                          </td>
                          <td className="p-2 text-gray-600">{row.category}</td>
                          <td className="p-2 font-semibold">₹{row.price}</td>
                          <td className="p-2 text-gray-600">{row.stock}</td>
                          <td className="p-2">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <i className="fa-solid fa-check text-[10px]" /> Valid
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200"
                                title={row.error}
                              >
                                <i className="fa-solid fa-triangle-exclamation text-[10px]" /> {row.error}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Options */}
            <div className="flex items-center justify-between py-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 select-none">
                <input
                  type="checkbox"
                  checked={updateExistingOnImport}
                  onChange={(e) => setUpdateExistingOnImport(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                />
                <span>Update existing items if product ID matches database record</span>
              </label>
            </div>

            {/* Summary Report after Import */}
            {importStats && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                  <i className="fa-solid fa-square-poll-vertical text-emerald-600 text-sm" />
                  <span>Import Summary Report</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                    <span className="text-gray-500 block text-[11px]">Total Rows</span>
                    <span className="text-base font-bold text-gray-900">{importStats.totalProcessed}</span>
                  </div>
                  <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200">
                    <span className="text-emerald-700 block text-[11px]">Created (New)</span>
                    <span className="text-base font-bold text-emerald-800">+{importStats.createdCount}</span>
                  </div>
                  <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-200">
                    <span className="text-blue-700 block text-[11px]">Updated</span>
                    <span className="text-base font-bold text-blue-800">{importStats.updatedCount}</span>
                  </div>
                </div>

                {importStats.errors && importStats.errors.length > 0 && (
                  <div className="mt-1 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 max-h-28 overflow-y-auto">
                    <span className="font-bold block mb-1">Row Errors ({importStats.errors.length}):</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {importStats.errors.map((err, i) => (
                        <li key={i}>
                          Row {err.row}: {err.title ? `"${err.title}" - ` : ''}
                          {err.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                {importStats ? 'Done' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleRunImport}
                disabled={!csvFile || isImporting}
                style={{ color: '#ffffff' }}
                className={`px-5 py-2 text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-2 ${
                  !csvFile || isImporting
                    ? 'bg-gray-300 !text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-700 hover:bg-emerald-800 !text-white'
                }`}
              >
                {isImporting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin text-xs" style={{ color: '#ffffff' }} />
                    <span style={{ color: '#ffffff' }}>Importing Products...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check text-xs" style={{ color: '#ffffff' }} />
                    <span style={{ color: '#ffffff' }}>Run Bulk Import</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    <ViewProductDrawer
      open={!!viewProduct}
      product={viewProduct}
      loading={viewLoading}
      categories={availableCategories}
      onClose={() => setViewProduct(null)}
      onSaved={(updated) => { if (updated) setViewProduct(updated); setIsNavigating(true); router.refresh(); setTimeout(() => setIsNavigating(false), 600); }}
      onDeleted={() => { if (viewProduct?.id) setProducts((prev) => prev.filter((p) => p.id !== viewProduct.id)); setIsNavigating(true); router.refresh(); setTimeout(() => setIsNavigating(false), 600); }}
    />
    </div>
  );
}
