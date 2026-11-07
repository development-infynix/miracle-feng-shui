'use client';

import React, { useEffect } from 'react';

/**
 * Like the orders and products pages, only the dashboard area scrolls; the window itself doesn't,
 * so the sidebar and the browser's scrollbar stay put. On phones the menu bar (3rem) sits above it.
 */
export default function DashboardScrollArea({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div className="h-[calc(100dvh-3rem)] lg:h-dvh overflow-hidden -mx-3 -my-5 sm:-mx-4 lg:-mx-5">
      <div className="h-full overflow-y-auto overscroll-contain px-3 py-5 sm:px-4 lg:px-5">{children}</div>
    </div>
  );
}
