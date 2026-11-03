'use client';

import React, { useRef } from 'react';
import { LuPlus } from 'react-icons/lu';

interface ItemDetailsFieldProps {
  value: string[];
  onChange: (details: string[]) => void;
}

const inputClass =
  'w-full rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-900 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10';

/** One input per item detail, with a + button on the last row. Blank rows are removed on save. */
export default function ItemDetailsField({ value, onChange }: ItemDetailsFieldProps) {
  const rows = value.length > 0 ? value : [''];
  const rowToFocus = useRef<number | null>(null);

  const addRow = () => {
    rowToFocus.current = rows.length;
    onChange([...rows, '']);
  };

  const updateRow = (index: number, text: string) => {
    onChange(rows.map((row, i) => (i === index ? text : row)));
  };

  // Text inputs drop line breaks, so a pasted list is split into one row per line.
  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const lines = e.clipboardData
      .getData('text')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length < 2) return;

    e.preventDefault();
    const before = rows.slice(0, index);
    const after = rows.slice(index + 1);
    const current = rows[index].trim() ? [rows[index]] : [];
    rowToFocus.current = before.length + current.length + lines.length - 1;
    onChange([...before, ...current, ...lines, ...after]);
  };

  return (
    <div>
      <span className="block text-xs font-semibold text-stone-500 mb-1.5">Item Details</span>
      <div className="space-y-2">
        {rows.map((detail, index) => {
          const isLast = index === rows.length - 1;
          return (
            <div key={index} className="flex items-center gap-2">
              <input
                ref={(input) => {
                  if (input && rowToFocus.current === index) {
                    input.focus();
                    rowToFocus.current = null;
                  }
                }}
                type="text"
                aria-label={`Item detail ${index + 1}`}
                placeholder="e.g. Hand-hammered 7-metal bronze alloy"
                value={detail}
                onChange={(e) => updateRow(index, e.target.value)}
                onPaste={(e) => handlePaste(index, e)}
                onKeyDown={(e) => {
                  // Enter moves to a new row here instead of submitting the whole form.
                  if (e.key !== 'Enter') return;
                  e.preventDefault();
                  if (isLast) addRow();
                }}
                className={inputClass}
              />
              {isLast && (
                <button
                  type="button"
                  aria-label="Add another item detail"
                  title="Add another item detail"
                  onClick={addRow}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-stone-900 text-white transition-colors hover:bg-stone-700 cursor-pointer"
                >
                  <LuPlus className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
