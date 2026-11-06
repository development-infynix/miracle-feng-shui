import React from 'react';
import Link from 'next/link';

// Shared pieces of the Stone & Gold homepage.
// globals.css sets colour and font on links, buttons and headings outside Tailwind's layers,
// so text styles go on an inner span.

export const CONTAINER = 'mx-auto w-full max-w-[1280px] px-4 sm:px-6';
export const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141210]';

const pillBase = `group inline-flex h-12 shrink-0 items-center justify-center px-6 transition-[background-color,box-shadow] duration-300 ${focusRing}`;
const pillPrimary = `${pillBase} bg-ink-fill hover:shadow-[0_10px_28px_rgba(231,169,59,0.45)]`;
const pillOutline = `${pillBase} border border-ink hover:bg-white/60`;
// On a filled tile: a stone block with an ink label.
const pillLight = `${pillBase} bg-stone hover:shadow-[0_10px_28px_rgba(231,169,59,0.45)]`;
const pillText = 'font-geist text-[15px] font-semibold leading-none';

/** A charcoal, outline or (on filled tiles) stone block that links somewhere. */
export function PillLink({
  href,
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ComponentProps<typeof Link> & { variant?: 'primary' | 'outline' | 'light' }) {
  const shape = variant === 'primary' ? pillPrimary : variant === 'light' ? pillLight : pillOutline;
  return (
    <Link href={href} className={`${shape} ${className}`} {...props}>
      <span className={`${pillText} ${variant === 'primary' ? 'text-stone' : 'text-ink'}`}>{children}</span>
    </Link>
  );
}

/** The same pill as a button. */
export function PillButton({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' }) {
  return (
    <button type="button" className={`${variant === 'primary' ? pillPrimary : pillOutline} cursor-pointer ${className}`} {...props}>
      <span className={`${pillText} ${variant === 'primary' ? 'text-stone' : 'text-ink'}`}>{children}</span>
    </button>
  );
}

/** A section's heading row: a hairline rule, a serif heading and an optional link on the right. */
export function SectionHeading({
  id,
  title,
  action,
}: {
  id: string;
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-ink/15 pt-5 sm:pt-6">
      <h2 id={id}>
        <span className="font-display text-[22px] font-normal leading-tight tracking-[-0.01em] text-ink sm:text-[36px] sm:font-bold sm:tracking-[-0.02em]">{title}</span>
      </h2>
      {action && <TextLink href={action.href}>{action.label}</TextLink>}
    </div>
  );
}

/** An underlined text link, such as View all. */
export function TextLink({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  return (
    <Link href={href} className={`group shrink-0 rounded-sm ${focusRing}`}>
      <span
        className={`font-geist text-[15px] font-semibold underline decoration-[1.5px] underline-offset-[6px] transition-colors ${light ? 'text-stone group-hover:text-[#F3DDA8]' : 'text-ink group-hover:text-logo-purple'}`}
      >
        {children}
      </span>
    </Link>
  );
}

/** Opens the site's sign in modal, which the header listens for. */
export function openAuthModal(mode: 'signin' | 'register' = 'signin') {
  window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode } }));
}
