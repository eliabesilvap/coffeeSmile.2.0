'use client';

import { useEffect, useState } from 'react';

const SCROLL_THRESHOLD = 300;

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Voltar ao topo"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-200 bg-white/90 text-brand-700 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
    >
      <span aria-hidden="true" className="text-lg leading-none">
        ↑
      </span>
    </button>
  );
}
