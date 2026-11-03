'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { CategoryOption } from '../types';

interface CategorySelectProps {
  labelId: string;
  value: string;
  options: CategoryOption[];
  onChange: (id: string) => void;
}

export default function CategorySelect({ labelId, value, options, onChange }: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.id === value);

  // While open, close on an outside click or Escape.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
      >
        <span className="truncate">{selected?.name || 'Select a category'}</span>
        <LuChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-labelledby={labelId}
          className="absolute left-0 right-0 top-full mt-2 z-10 rounded-lg border border-gray-200 bg-white shadow-xl overflow-y-auto max-h-48 [scrollbar-width:thin] [scrollbar-color:#d6d3d1_transparent]"
        >
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={option.id === value}
              onClick={() => {
                onChange(option.id);
                setOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-xs font-semibold cursor-pointer hover:bg-gray-100 ${
                option.id === value ? 'bg-gray-100 text-black' : 'text-gray-700'
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
