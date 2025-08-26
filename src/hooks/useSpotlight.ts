import { useEffect } from 'react';

export function useSpotlight() {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.spotlight');
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    const onMove = (e: MouseEvent) => {
      el.style.setProperty('--x', `${(e.clientX / window.innerWidth) * 100}%`);
      el.style.setProperty('--y', `${(e.clientY / window.innerHeight) * 100}%`);
    };
    
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
}