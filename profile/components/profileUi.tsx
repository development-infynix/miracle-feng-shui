import React from 'react';

export const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3A1F62]';
export const card = 'rounded-lg bg-white p-5 shadow-[0_6px_10px_rgba(67,23,105,0.14)] sm:p-6';
export const primaryButton = `inline-flex h-12 cursor-pointer items-center justify-center rounded-md bg-[#431769] px-6 transition-colors hover:bg-[#3A1F62] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;
export const secondaryButton = `group inline-flex h-12 cursor-pointer items-center justify-center rounded-md border border-[#431769] px-5 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;
export const smallButton = `group inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#431769]/30 px-3.5 ${focusRing}`;
export const textButton = `group cursor-pointer rounded-sm disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;
export const primaryLabel = 'font-outfit text-[15px] font-semibold text-white';
export const secondaryLabel = 'font-outfit text-[15px] font-semibold text-[#431769] transition-colors group-hover:text-[#7A2FC0]';
export const smallLabel = 'font-outfit text-[14px] font-semibold text-[#431769] transition-colors group-hover:text-[#7A2FC0]';
export const textLabel = 'font-outfit text-[14px] font-medium text-[#431769] underline underline-offset-2 transition-colors group-hover:text-[#7A2FC0]';
export const skeleton = 'animate-pulse rounded-sm bg-[#431769]/10 motion-reduce:animate-none';

export function CardHeading({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-3">
      <h2>
        <span className="block font-serif text-[22px] font-bold tracking-tight text-[#111111]">{children}</span>
      </h2>
      {action}
    </div>
  );
}

/** A label above a value, for details that aren't being edited. */
export function Detail({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="font-outfit text-[13px] text-[#5B4A70]">{label}</dt>
      <dd className="mt-0.5 break-words font-outfit text-[16px] font-medium text-[#111111]">{value}</dd>
    </div>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string; hint?: string };

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(function Field({ label, id, hint, className = '', ...input }, ref) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block font-outfit text-[13px] font-semibold text-[#431769]">
        {label}
      </label>
      <input
        {...input}
        ref={ref}
        id={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        // Replaces the site-wide outline with the field's own focus ring.
        style={{ outline: 'none' }}
        className="mt-1.5 h-12 w-full rounded-md border border-[#431769]/25 bg-white px-4 font-outfit text-[16px] text-[#111111] caret-[#7A2FC0] transition-[border-color,box-shadow] placeholder:text-[#5B4A70] focus:border-[#7A2FC0] focus:shadow-[0_0_0_3px_rgba(122,47,192,0.18)] disabled:cursor-not-allowed disabled:bg-[#F7F4EC] disabled:text-[#5B4A70]"
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 font-outfit text-[13px] text-[#5B4A70]">
          {hint}
        </p>
      )}
    </div>
  );
});

export function FormError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="font-outfit text-[14px] font-medium text-[#8F1610]">
      {children}
    </p>
  );
}

export function FormSuccess({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="flex items-center gap-2 font-outfit text-[14px] font-medium text-[#431769]">
      <i aria-hidden="true" className="fa-solid fa-check text-[12px]" />
      {children}
    </p>
  );
}
