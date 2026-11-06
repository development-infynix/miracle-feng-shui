import React from 'react';
import { PillButton, openAuthModal } from '../homeUi';

/**
 * How a tile is painted. Most are outlined on the stone page; a few are filled with a brand colour
 * and carry a line illustration, so the bento has rhythm.
 */
export type TileTone = 'outline' | 'purple' | 'charcoal';

const TONE: Record<TileTone, string> = {
  outline: 'border border-ink/25',
  purple: 'bg-logo-purple',
  charcoal: 'bg-ink-fill',
};

/** One tile of the bento: a serif title, its content, and an optional illustration. */
export function BentoTile({
  title,
  titleId,
  tone = 'outline',
  art,
  action,
  className = '',
  children,
}: {
  title: string;
  titleId: string;
  tone?: TileTone;
  /** A control on the right of the title row, such as View all. */
  action?: React.ReactNode;
  /** A decorative line illustration; the tile that passes it also places it. */
  art?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const filled = tone !== 'outline';
  return (
    <section aria-labelledby={titleId} className={`relative isolate flex flex-col overflow-hidden p-5 sm:p-6 ${TONE[tone]} ${className}`}>
      <div className="relative z-10 flex items-center justify-between gap-3">
        <h3 id={titleId}>
          <span
            className={`font-display text-[21px] font-bold leading-tight tracking-[-0.01em] sm:text-[24px] ${filled ? 'text-stone' : 'text-ink'}`}
          >
            {title}
          </span>
        </h3>
        {action}
      </div>
      <div className="relative z-10 mt-3 flex flex-1 flex-col">{children}</div>
      {art}
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
export function SkeletonLine({ className = '', light = false }: { className?: string; light?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`block h-4 animate-pulse motion-reduce:animate-none ${light ? 'bg-stone/20' : 'bg-ink/10'} ${className}`}
    />
  );
}
