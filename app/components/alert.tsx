'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { LuTriangleAlert, LuX } from 'react-icons/lu';

export interface AlertAction {
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'danger' | 'primary';
  disabled?: boolean;
}

export interface AlertProps {
  open: boolean;
  title: string;
  description?: string;
  actions?: AlertAction[];
  tone?: 'danger' | 'info' | 'warning';
  onClose?: () => void;
}

const toneIcon: Record<string, string> = {
  danger: 'bg-red-50 text-red-600 border-red-200',
  warning: 'bg-amber-50 text-amber-600 border-amber-200',
  info: 'bg-stone-100 text-stone-600 border-stone-200',
};

const variantClass: Record<string, string> = {
  default:
    'border border-stone-300 bg-white text-stone-700 hover:bg-stone-100',
  primary:
    'bg-stone-900 text-white hover:bg-stone-700',
  danger:
    'bg-red-600 text-white hover:bg-red-700',
};

export default function Alert({
  open,
  title,
  description,
  actions = [],
  tone = 'info',
  onClose,
}: AlertProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-sm rounded-xl border border-stone-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {onClose && (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          >
            <LuX className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${toneIcon[tone]}`}
          >
            <LuTriangleAlert className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-stone-900">{title}</h3>
            {description && (
              <p className="mt-1 text-xs leading-relaxed text-stone-500">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions.length > 0 && (
          <div className="mt-5 flex items-center justify-end gap-2">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                disabled={action.disabled}
                className={`inline-flex h-9 items-center justify-center rounded-md px-4 text-xs font-semibold transition-colors disabled:opacity-50 ${
                  variantClass[action.variant || 'default']
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
