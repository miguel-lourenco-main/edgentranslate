'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * A React hook that manages header visibility based on scroll direction
 * 
 * This hook will:
 * 1. Show header when scrolling up
 * 2. Hide header when scrolling down (after 100px threshold)
 * 3. Handle browser compatibility and cleanup
 * 
 * @returns {boolean} Whether the header should be visible
 * 
 * @example
 * ```tsx
 * const Header = () => {
 *   const isVisible = useScrollHeader();
 *   
 *   return (
 *     <header className={`fixed top-0 transition-transform ${
 *       isVisible ? 'translate-y-0' : '-translate-y-full'
 *     }`}>
 *       // Header content
 *     </header>
 *   );
 * };
 * ```
 */
export const useScrollHeader = (): boolean => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const controlHeader = useCallback(() => {
    if (typeof window === 'undefined') return;

    const currentScrollY = window.scrollY;

    if (currentScrollY < lastScrollY) {
      setIsVisible(true);
    } else if (currentScrollY > 100 && currentScrollY > lastScrollY) {
      setIsVisible(false);
    }

    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('scroll', controlHeader);
    return () => window.removeEventListener('scroll', controlHeader);
  }, [controlHeader]);

  return isVisible;
};