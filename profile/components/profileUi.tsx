import React from 'react';

export const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#222222]';
export const card = 'rounded-2xl border border-[#E1E3DF] bg-white p-5 sm:p-6';
export const primaryButton = `inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-[#222222] px-6 transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;
export const secondaryButton = `group inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-[#222222] px-5 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;
export const smallButton = `group inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#222222]/30 px-3.5 ${focusRing}`;
export const textButton = `group cursor-pointer rounded-sm disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;
export const primaryLabel = 'text-[15px] font-semibold text-white';
export const secondaryLabel = 'text-[15px] font-semibold text-[#222222] transition-colors group-hover:underline';
export const smallLabel = 'text-[14px] font-semibold text-[#222222] transition-colors group-hover:underline';
export const textLabel = 'text-[14px] font-medium text-[#222222] underline underline-offset-2 transition-colors group-hover:underline';
export const skeleton = 'animate-pulse rounded-sm bg-[#222222]/10 motion-reduce:animate-none';

export function CardHeading({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-3">
      <h2>
        <span className="block font-serif text-[22px] font-bold tracking-tight text-[#222222]">{children}</span>
      </h2>
      {action}
    </div>
  );
}

/** A label above a value, for details that aren't being edited. */
export function Detail({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-[13px] text-[#595959]">{label}</dt>
      <dd className="mt-0.5 break-words text-[16px] font-medium text-[#222222]">{value}</dd>
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
      <label htmlFor={id} className="block text-[13px] font-semibold text-[#222222]">
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
            className={`h-12 w-full rounded-lg border border-[#222222]/25 bg-white pl-4 ${inside ? 'pr-12' : 'pr-4'} text-[16px] text-[#222222] caret-[#222222] transition-[border-color,box-shadow] placeholder:text-[#595959] focus:border-[#222222] focus:shadow-[0_0_0_3px_rgba(34,34,34,0.12)] disabled:cursor-not-allowed disabled:bg-[#F7F4EC] disabled:text-[#595959]`}
          />
          {inside && <div className="absolute inset-y-0 end-1 flex items-center">{inside}</div>}
        </div>
        {action}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-[13px] text-[#595959]">
          {hint}
        </p>
      )}
    </div>
  );
});

export function FormError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="text-[14px] font-medium text-[#8F1610]">
      {children}
    </p>
  );
}

export function FormSuccess({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="flex items-center gap-2 text-[14px] font-medium text-[#222222]">
      <i aria-hidden="true" className="fa-solid fa-check text-[12px]" />
      {children}
    </p>
  );
}
