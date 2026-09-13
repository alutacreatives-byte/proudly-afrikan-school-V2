import { useRef, useEffect } from 'react';

/**
 * Shared hook to smoothly scroll down to newly generated results across STUDY and BUILD.
 * Scrolls directly to the top of the newly generated result area so the user
 * immediately sees the beginning of the result without scrolling to the footer
 * or bottom of the entire page.
 */
export function useScrollToResult<T>(result: T | null, isGenerating: boolean) {
  const resultRef = useRef<HTMLDivElement>(null);
  const wasGeneratingRef = useRef<boolean>(false);

  useEffect(() => {
    // When generation transitions from true -> false with a valid result
    if (wasGeneratingRef.current && !isGenerating && result) {
      const timer = setTimeout(() => {
        if (!resultRef.current) return;

        // Check if inside a modal scroll container (overflow-y-auto)
        const scrollParent = resultRef.current.closest('.overflow-y-auto') as HTMLElement | null;
        if (scrollParent) {
          const parentRect = scrollParent.getBoundingClientRect();
          const targetRect = resultRef.current.getBoundingClientRect();
          const targetTop = targetRect.top - parentRect.top + scrollParent.scrollTop - 16;

          scrollParent.scrollTo({
            top: Math.max(0, targetTop),
            behavior: 'smooth',
          });
          return;
        }

        // Normal full-page scrolling with sticky navigation header clearance
        const headerOffset = 96;
        const elementPosition = resultRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth',
        });
      }, 100);

      return () => clearTimeout(timer);
    }

    wasGeneratingRef.current = isGenerating;
  }, [isGenerating, result]);

  return resultRef;
}
