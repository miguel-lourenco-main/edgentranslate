'use client';

import React, { createContext, useContext, useRef } from 'react';

/**
 * Context type definition for smooth scrolling functionality
 */
interface SmoothScrollContextType {
  /** Reference to the scrollable anchor element */
  anchorRef: React.RefObject<HTMLDivElement | null>;
  /** Function to smoothly scroll to a specific Y position */
  smoothScrollTo: (targetY: number) => void;
}

export const SmoothScrollContext = createContext<SmoothScrollContextType | undefined>(undefined);

/**
 * Provider component that enables smooth scrolling functionality
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {number} [props.threshold] - Optional scroll threshold
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode, threshold?: number }) {
  const anchorRef = useRef<HTMLDivElement>(null);

  /**
   * Smoothly scrolls to a target Y position using easing
   * @param {number} targetY - Target scroll position in pixels
   */
  const smoothScrollTo = (targetY: number) => {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = 1000; // ms
    let start: number;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const percentage = Math.min(progress / duration, 1);
      
      // Cubic easing function for smooth acceleration/deceleration
      const easeInOutCubic = (t: number) => 
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

      window.scrollTo(0, startY + distance * easeInOutCubic(percentage));

      if (progress < duration) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }

  return (
    <SmoothScrollContext.Provider value={{ anchorRef, smoothScrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

/**
 * Hook to access smooth scrolling functionality
 * 
 * @returns {SmoothScrollContextType} Smooth scroll context values
 * @throws {Error} If used outside of SmoothScrollProvider
 * 
 * @example
 * ```tsx
 * const { smoothScrollTo } = useSmoothScroll();
 * 
 * return (
 *   <button onClick={() => smoothScrollTo(500)}>
 *     Scroll to 500px
 *   </button>
 * );
 * ```
 */
export function useSmoothScroll() {
  const context = useContext(SmoothScrollContext);
  if (context === undefined) {
    throw new Error('useSmoothScroll must be used within a SmoothScrollProvider');
  }
  return context;
}