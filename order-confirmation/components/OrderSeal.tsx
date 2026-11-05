import React, { useId } from 'react';

// Where each droplet flies to, in pixels from the centre of the seal.
const DROPLETS = [
  { x: 0, y: -66, size: 18 },
  { x: 48, y: -46, size: 13 },
  { x: 68, y: 2, size: 19 },
  { x: 46, y: 48, size: 12 },
  { x: -2, y: 68, size: 17 },
  { x: -48, y: 44, size: 14 },
  { x: -68, y: -4, size: 18 },
  { x: -44, y: -50, size: 12 },
];

/**
 * The page's one authored moment: a plum seal swells, throws droplets that stretch on threads of
 * the same liquid as the navigation and then detach, and a check draws itself on top.
 * With reduced motion, only the finished seal shows.
 */
export function ConfirmedSeal() {
  // Unique per render, because a filter can't be shared with a hidden copy of itself.
  const filterId = `seal-goo-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div aria-hidden="true" className="relative h-44 w-44">
      <svg className="absolute h-0 w-0">
        <defs>
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix in="blur" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" />
          </filter>
        </defs>
      </svg>

      <div className="absolute inset-0" style={{ filter: `url(#${filterId})` }}>
        {DROPLETS.map(({ x, y, size }, index) => (
          <span
            key={index}
            className="seal-droplet absolute left-1/2 top-1/2 rounded-full bg-[#431769]"
            style={
              {
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop: -size / 2,
                '--seal-x': `${x}px`,
                '--seal-y': `${y}px`,
                animationDelay: `${180 + index * 22}ms`,
              } as React.CSSProperties
            }
          />
        ))}
        <span className="seal-core absolute left-1/2 top-1/2 -ml-10 -mt-10 h-20 w-20 rounded-full bg-[#431769]" />
      </div>

      <svg viewBox="0 0 24 24" className="absolute left-1/2 top-1/2 -ml-[18px] -mt-[18px] h-9 w-9" fill="none">
        <path
          className="seal-check"
          d="M5 12.5l4.6 4.6L19 7.5"
          pathLength={1}
          stroke="#FFFFFF"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/** For anything that isn't a success. No celebration, just a calm status. */
export function StatusSeal({ icon, tone }: { icon: string; tone: 'waiting' | 'stopped' }) {
  return (
    <div aria-hidden="true" className="flex h-24 w-24 items-center justify-center">
      <span className={`glass-veil flex h-20 w-20 items-center justify-center rounded-full shadow-[0_6px_10px_rgba(67,23,105,0.14),inset_0_2px_0_rgba(255,255,255,0.7)] ${tone === 'stopped' ? 'text-[#8F1610]' : 'text-[#431769]'}`}>
        <i className={`${icon} text-[28px]`} />
      </span>
    </div>
  );
}
