'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollToTop() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  // Always reset scroll to the very top when page/route changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  // Track scroll position to show/hide the floating Scroll To Top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {isVisible && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-[#222222] hover:text-white hover:bg-[#F1641E] border border-gray-200 shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center cursor-pointer group select-none active:scale-95"
        >
          <i className="fa-solid fa-arrow-up text-[13px] sm:text-[14px] transition-transform duration-200 group-hover:-translate-y-0.5" />
        </button>
      )}
    </>
  );
}
