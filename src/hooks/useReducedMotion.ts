import { useEffect, useState } from "react";

/**
 * Hook to detect if user prefers reduced motion
 * Returns true if user has reduced motion preference enabled
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}

/**
 * Hook to detect if we're on a mobile device
 * Useful for disabling heavy animations on mobile
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

/**
 * Combined hook for performance-conscious animations
 * Returns true if heavy animations should be disabled
 */
export function useShouldReduceAnimations(): boolean {
  const prefersReduced = useReducedMotion();
  const isMobile = useIsMobile();

  // Also check for low-end devices using navigator.hardwareConcurrency
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    // Consider devices with <= 4 cores as low-end
    setIsLowEnd(navigator.hardwareConcurrency <= 4);
  }, []);

  return prefersReduced || isMobile || isLowEnd;
}