'use client';

import React, { useEffect, useId, useRef, useState } from 'react';

const GAP = 24;
const FILL = 'linear-gradient(to bottom, #F3ECFB, #DCCDF0)';
// How much of the drop shape stays visible while tucked inside the main pill.
const TUCKED_HEIGHT = 44;

interface GooNavShellProps {
  open: boolean;
  /** The control the liquid thread hangs from. */
  triggerRef: React.RefObject<HTMLElement | null>;
  /** Change this when triggerRef moves to another control; the thread slides across to it. */
  threadKey?: string;
  dropId: string;
  /** Contents of the shape that drops down. */
  drop: React.ReactNode;
  /** Contents of the main pill. */
  children: React.ReactNode;
  /** Shrink the main pill to its contents and centre it, instead of filling the width. */
  fitMain?: boolean;
  /** Main pill height before measuring, so the first paint is right. */
  mainHeight?: number;
  dropRadius?: number;
  dropClassName?: string;
  dropWrapperClassName?: string;
  /**
   * Space to reserve below the main pill while open, which pushes the page down.
   * Without it, the drop shape floats over the page. It's a class so the server
   * render has the right height.
   */
  openSpaceClassName?: string;
}

/**
 * Two glass shapes joined by a liquid thread.
 *
 * The shapes live in their own layer behind the content, under an SVG "goo" filter:
 * blur plus an alpha threshold makes nearby shapes melt together. The content stays
 * outside that layer, because the filter would melt the text too. Without filter
 * support the shapes still show, joined by a plain connector.
 */
export default function GooNavShell({
  open,
  triggerRef,
  threadKey,
  dropId,
  drop,
  children,
  fitMain = false,
  mainHeight: initialMainHeight = 56,
  dropRadius = 9999,
  dropClassName = 'w-fit max-w-full',
  dropWrapperClassName = '',
  openSpaceClassName,
}: GooNavShellProps) {
  // Unique per shell: a filter inside a display:none shell can't be shared with a visible one.
  const filterId = `nav-goo-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState({
    mainHeight: initialMainHeight,
    dropLeft: 0,
    dropWidth: 0,
    dropHeight: TUCKED_HEIGHT,
    threadX: 0,
    mainLeft: 0,
    mainWidth: 0,
  });

  useEffect(() => {
    const root = rootRef.current;
    const main = mainRef.current;
    const dropEl = dropRef.current;
    if (!root || !main || !dropEl) return;

    const measure = () => {
      const rootLeft = root.getBoundingClientRect().left;
      const trigger = triggerRef.current?.getBoundingClientRect();
      const dropLeft = dropEl.offsetLeft;
      const dropWidth = dropEl.offsetWidth;
      const triggerCenter = trigger ? trigger.left + trigger.width / 2 - rootLeft : dropLeft;
      setGeometry({
        mainHeight: main.offsetHeight || initialMainHeight,
        mainLeft: main.offsetLeft,
        mainWidth: main.offsetWidth,
        dropLeft,
        dropWidth,
        dropHeight: dropEl.offsetHeight || TUCKED_HEIGHT,
        // Keep the thread on the shape's straight edge, clear of its rounded ends.
        threadX: Math.max(dropLeft + 28, Math.min(triggerCenter, dropLeft + dropWidth - 28)),
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(main);
    observer.observe(dropEl);
    return () => observer.disconnect();
  }, [triggerRef, initialMainHeight, threadKey]);

  const { mainHeight, dropLeft, dropWidth, dropHeight, threadX, mainLeft, mainWidth } = geometry;
  // A shell hidden by its parent measures zero wide and draws no drop shape.
  const hasDrop = dropWidth > 0;

  // Closed, the drop shape is squeezed and tucked inside the main pill, so the goo hides it.
  const tucked = Math.min(dropHeight, TUCKED_HEIGHT);
  const dropTransform = open
    ? 'translateY(0) scale(1, 1)'
    : `translateY(${-(GAP + tucked)}px) scale(0.55, ${tucked / dropHeight})`;
  // Scaling a tall panel magnifies overshoot, so it gets a gentler settle than the pill.
  const openEase = dropHeight > 80 ? 'ease-[cubic-bezier(0.22,1.08,0.36,1)]' : 'ease-[cubic-bezier(0.22,1.3,0.36,1)]';
  const motion = open
    ? `duration-[640ms] ${openEase}`
    : 'duration-[300ms] ease-[cubic-bezier(0.55,0,0.8,0.4)]';

  return (
    <div
      ref={rootRef}
      data-goo-shell={dropId}
      className={`relative transition-[padding] duration-[420ms] ease-out motion-reduce:transition-none ${open ? (openSpaceClassName ?? '') : ''}`}
    >
      <svg aria-hidden="true" className="absolute h-0 w-0">
        <defs>
          <filter id={filterId} x="-2%" y="-15%" width="104%" height="150%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
            <feColorMatrix in="blur" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            {/* Puffy edge: a bright rim along the top and a soft purple shade along the bottom. */}
            <feOffset in="goo" dy="2" result="down" />
            <feComposite in="goo" in2="down" operator="out" result="topEdge" />
            <feFlood floodColor="#FFFFFF" floodOpacity="0.7" />
            <feComposite in2="topEdge" operator="in" result="rim" />
            <feOffset in="goo" dy="-3" result="up" />
            <feComposite in="goo" in2="up" operator="out" />
            <feGaussianBlur stdDeviation="2" result="bottomEdge" />
            <feFlood floodColor="#431769" floodOpacity="0.16" />
            <feComposite in2="bottomEdge" operator="in" result="shade" />
            <feMerge result="lit">
              <feMergeNode in="goo" />
              <feMergeNode in="shade" />
              <feMergeNode in="rim" />
            </feMerge>
            {/* Translucent, so the content's backdrop blur shows the page through the glass. */}
            <feComponentTransfer in="lit">
              <feFuncA type="linear" slope="0.94" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      {/* Shapes */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: mainHeight + GAP + dropHeight + 12,
          filter: `url(#${filterId}) drop-shadow(0 6px 10px rgba(67, 23, 105, 0.14))`,
        }}
      >
        <div
          className="absolute top-0 rounded-full"
          style={{
            height: mainHeight,
            background: FILL,
            left: fitMain ? mainLeft : 0,
            width: fitMain ? mainWidth : '100%',
          }}
        />
        {hasDrop && (
          <>
            <div
              className={`absolute origin-top rounded-full bg-[#E6DBF3] transition-[left,width,transform] motion-reduce:transition-none ${open ? 'duration-[760ms] ease-out' : 'duration-[200ms] ease-in'}`}
              style={{
                left: threadX,
                top: mainHeight - 14,
                height: GAP + 28,
                width: open ? 14 : 48,
                transform: `translateX(-50%) scaleY(${open ? 1 : 0})`,
              }}
            />
            <div
              className={`absolute origin-top transition-transform motion-reduce:transition-none ${motion}`}
              style={{
                left: dropLeft,
                top: mainHeight + GAP,
                width: dropWidth,
                height: dropHeight,
                borderRadius: dropRadius,
                background: FILL,
                transform: dropTransform,
              }}
            />
          </>
        )}
      </div>

      {/* Main pill content */}
      <div
        ref={mainRef}
        className={`relative z-20 rounded-full backdrop-blur-xl pointer-events-auto ${fitMain ? 'mx-auto w-fit' : ''}`}
      >
        {children}
      </div>

      {/* Drop content */}
      <div
        className={`absolute inset-x-0 z-10 flex justify-center pointer-events-none ${dropWrapperClassName}`}
        style={{ top: mainHeight + GAP }}
      >
        <div
          ref={dropRef}
          id={dropId}
          inert={!open}
          className={`origin-top overflow-hidden backdrop-blur-xl motion-reduce:transition-none ${motion} ${dropClassName} ${open ? 'pointer-events-auto opacity-100 transition-[transform,opacity]' : 'invisible opacity-0 transition-[transform,opacity,visibility]'}`}
          // Until it's measured the shape layer can't draw this, so it fills itself.
          style={{ transform: dropTransform, borderRadius: dropRadius, background: hasDrop ? undefined : FILL }}
        >
          {drop}
        </div>
      </div>
    </div>
  );
}
