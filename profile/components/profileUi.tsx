import React from 'react';

export const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink';
export const card = 'border border-ink/25 p-5 sm:p-6';
export const primaryButton = `inline-flex h-12 cursor-pointer items-center justify-center bg-ink-fill px-6 transition-shadow duration-300 hover:shadow-[0_8px_22px_rgba(231,169,59,0.45)] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;
export const secondaryButton = `group inline-flex h-12 cursor-pointer items-center justify-center border border-ink px-5 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;
export const smallButton = `group inline-flex h-10 cursor-pointer items-center justify-center gap-2 border border-ink/30 px-3.5 ${focusRing}`;
export const textButton = `group cursor-pointer rounded-sm disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;
export const primaryLabel = 'font-geist text-[15px] font-semibold text-stone';
export const secondaryLabel = 'font-geist text-[15px] font-semibold text-ink transition-colors group-hover:text-logo-purple';
export const smallLabel = 'font-geist text-[14px] font-semibold text-ink transition-colors group-hover:text-logo-purple';
export const textLabel = 'font-geist text-[14px] font-medium text-ink underline underline-offset-2 transition-colors group-hover:text-logo-purple';
export const skeleton = 'animate-pulse bg-ink/10 motion-reduce:animate-none';

export function CardHeading({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-3">
      <h2>
        <span className="block font-display text-[22px] font-bold tracking-tight text-ink">{children}</span>
      </h2>
      {action}
    </div>
  );
}

/** A label above a value, for details that aren't being edited. */
export function Detail({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="font-geist text-[13px] text-ink-muted">{label}</dt>
      <dd className="mt-0.5 break-words font-geist text-[16px] font-medium text-ink">{value}</dd>
    </div>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  hint?: string;
  /** A control beside the input, on the same line. */
  action?: React.ReactNode;
  /** A small control inside the input, at its end. */
  inside?: React.ReactNode;
};

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(function Field({ label, id, hint, action, inside, className = '', ...input }, ref) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block font-geist text-[13px] font-semibold text-ink">
        {label}
      </label>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            {...input}
            ref={ref}
            id={id}
            aria-describedby={hint ? `${id}-hint` : undefined}
            // Replaces the site-wide outline with the field's own focus ring.
            style={{ outline: 'none' }}
            className={`h-12 w-full border border-ink/25 bg-white pl-4 ${inside ? 'pr-12' : 'pr-4'} font-geist text-[16px] text-ink caret-ink transition-[border-color,box-shadow] placeholder:text-ink-muted focus:border-ink focus:shadow-[0_0_0_3px_rgba(20,18,16,0.12)] disabled:cursor-not-allowed disabled:bg-[#EEEBE3] disabled:text-ink-muted`}
          />
          {inside && <div className="absolute inset-y-0 end-1 flex items-center">{inside}</div>}
        </div>
        {action}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 font-geist text-[13px] text-ink-muted">
          {hint}
        </p>
      )}
    </div>
  );
});

export function FormError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="font-geist text-[14px] font-medium text-[#8F1610]">
      {children}
    </p>
  );
}

export function FormSuccess({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="flex items-center gap-2 font-geist text-[14px] font-medium text-ink">
      <i aria-hidden="true" className="fa-solid fa-check text-[12px]" />
      {children}
    </p>
  );
}
