'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import AddCategoryDrawer from './components/AddCategoryDrawer';
import CategoriesFooter from './components/CategoriesFooter';
import CategoriesToolbar from './components/CategoriesToolbar';
import CategoryCard from './components/CategoryCard';
import ViewCategoryDrawer from './components/ViewCategoryDrawer';
import { CategoryItem, CategoryOption, CategoryStats } from './types';

interface CategoriesClientProps {
  categories: CategoryItem[];
  total: number;
  page: number;
  totalPages: number;
  search?: string;
  stats: CategoryStats;
  categoryOptions: CategoryOption[];
}

function categoriesUrl(page: number, search: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set('q', search);
  return `/admin/categories?${params.toString()}`;
}

export default function CategoriesClient({
  categories,
  total,
  page,
  totalPages,
  search = '',
  stats,
  categoryOptions,
}: CategoriesClientProps) {
  const router = useRouter();
  const { refreshCategories } = useStore();
  const [isPending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState(search);
  const [addOpen, setAddOpen] = useState(false);
  const [viewCategory, setViewCategory] = useState<CategoryItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // This page has its own scrolling list, so the document itself shouldn't scroll.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Debounced server-side search. Comparing with the URL value means a page load
  // never triggers a redirect that would lose the current page number.
  useEffect(() => {
    const term = searchQuery.trim();
    if (term === search) return;
    const timer = setTimeout(() => {
      startTransition(() => router.replace(categoriesUrl(1, term)));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, search, router]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [categories]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const reloadData = () => {
    startTransition(() => router.refresh());
    // Keeps the storefront category tabs in step with this page.
    refreshCategories();
  };

  return (
    <div
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      className="flex flex-col gap-4 h-screen overflow-hidden -mx-3 -my-5 sm:-mx-4 lg:-mx-5"
    >
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20">
          <i className="fa-solid fa-circle-check text-emerald-400 text-base" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <CategoriesToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAdd={() => setAddOpen(true)}
        stats={stats}
      />

      <div ref={listRef} className="relative flex-1 min-h-0 overflow-y-auto scroll-smooth px-4 py-2">
        {isPending && (
          <div className="absolute inset-0 z-40 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-700" />
          </div>
        )}
        {categories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm shadow-2xs">
            {search ? 'No categories found matching your search.' : 'No categories yet. Add your first one.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} onView={setViewCategory} />
            ))}
          </div>
        )}
      </div>

      <CategoriesFooter
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={(nextPage) =>
          startTransition(() => router.push(categoriesUrl(nextPage, search)))
        }
      />

      {addOpen && (
        <AddCategoryDrawer
          onClose={() => setAddOpen(false)}
          onCreated={(name) => {
            setAddOpen(false);
            showToast(`Category "${name}" created.`);
            reloadData();
          }}
        />
      )}

      {viewCategory && (
        <ViewCategoryDrawer
          key={viewCategory.id}
          category={viewCategory}
          categoryOptions={categoryOptions}
          onClose={() => setViewCategory(null)}
          onSaved={(updated) => {
            setViewCategory(updated);
            showToast(`Category "${updated.name}" updated.`);
            reloadData();
          }}
          onDeleted={(name) => {
            setViewCategory(null);
            showToast(`Category "${name}" deleted.`);
            reloadData();
          }}
        />
      )}
    </div>
  );
}
