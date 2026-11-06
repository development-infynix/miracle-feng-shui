import React from 'react';
import { PillButton, openAuthModal } from '../homeUi';

/** One white tile of the bento: a serif title, then its content. */
export function BentoTile({
  title,
  titleId,
  className = '',
  children,
}: {
  title: string;
  titleId: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={titleId}
      className={`relative isolate flex flex-col overflow-hidden border border-ink/25 p-5 sm:p-6 ${className}`}
    >
      <h3 id={titleId}>
        <span className="font-display text-[21px] font-bold leading-tight tracking-[-0.01em] text-ink sm:text-[24px]">{title}</span>
      </h3>
      <div className="mt-3 flex flex-1 flex-col">{children}</div>
    </section>
  );
}

/** A tile's body for guests: why signing in helps, and the button that opens the sign in modal. */
export function SignInPrompt({
  reason,
  label,
  variant = 'primary',
}: {
  reason: string;
  label: string;
  variant?: 'primary' | 'outline';
}) {
  return (
    <>
      <p className="font-geist text-[15px] leading-relaxed text-ink-muted">{reason}</p>
      <div className="mt-auto pt-5">
        <PillButton variant={variant} onClick={() => openAuthModal('signin')}>
          {label}
        </PillButton>
      </div>
    </>
  );
}

/** A small square product photo with sharp corners. */
export function Thumb({ src, size = 'h-12 w-12' }: { src?: string; size?: string }) {
  return (
    <span className={`block shrink-0 overflow-hidden bg-[#E2DDD1] ${size}`}>
      {src && <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />}
    </span>
  );
}

/** A grey bar standing in for text while a tile loads. */
export function SkeletonLine({ className = '' }: { className?: string }) {
  return <span aria-hidden="true" className={`block h-4 animate-pulse bg-ink/10 motion-reduce:animate-none ${className}`} />;
}
