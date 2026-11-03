'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-auth-modal', { detail: { mode: 'register' } })
      );
    }
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[13.5px] text-[#595959] font-medium">Redirecting to registration...</p>
      </div>
    </div>
  );
}
