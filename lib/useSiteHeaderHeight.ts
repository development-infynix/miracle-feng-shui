'use client';

import { useEffect, useState } from 'react';

/** The site header changes height as its category pill opens and closes. */
export function useSiteHeaderHeight() {
  const [height, setHeight] = useState(138);

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
