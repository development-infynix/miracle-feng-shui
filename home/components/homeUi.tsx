import React from 'react';
import Link from 'next/link';

// Shared pieces of the homepage, in a minimal marketplace style: dark text, light grey borders,
// rounded white cards and black pill buttons.

export const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222]';

/** A section's heading row: the title on the left and an optional "View all" on the right. */
export function SectionHeading({ id, title, viewAll }: { id: string; title: string; viewAll?: { href: string; label: string } }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 id={id}>
        <span className="block text-[20px] font-semibold tracking-tight text-[#222222] sm:text-[26px]">{title}</span>
      </h2>
      {viewAll && (
        <Link href={viewAll.href} className={`group inline-flex shrink-0 items-center gap-1.5 rounded-full px-1 ${focusRing}`}>
          <span className="text-[15px] font-semibold text-[#222222] underline decoration-1 underline-offset-4 group-hover:decoration-2">
            {viewAll.label}
          </span>
          <i aria-hidden="true" className="fa-solid fa-arrow-right text-[12px] text-[#222222] transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/** A black pill link, or an outlined one. */
export function PillLink({
  href,
  children,
  variant = 'solid',
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'solid' | 'outline';
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-11 items-center justify-center rounded-full px-5 transition-colors ${
        variant === 'solid' ? 'bg-[#222222] hover:bg-black' : 'border-2 border-[#222222] hover:bg-[#222222]/[0.06]'
      } ${focusRing}`}
    >
      <span className={`text-[15px] font-semibold ${variant === 'solid' ? 'text-white' : 'text-[#222222]'}`}>{children}</span>
    </Link>
  );
}
