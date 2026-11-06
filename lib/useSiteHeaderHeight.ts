'use client';

import { useEffect, useState } from 'react';

/** The site header's height, kept current if it ever changes (for example at a breakpoint). */
export function useSiteHeaderHeight() {
  const [height, setHeight] = useState(72);

  useEffect(() => {
    const siteHeader = document.getElementById('site-header');
    if (!siteHeader) return;
    const measure = () => setHeight(siteHeader.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(siteHeader);
    return () => observer.disconnect();
  }, []);

  return height;
}
