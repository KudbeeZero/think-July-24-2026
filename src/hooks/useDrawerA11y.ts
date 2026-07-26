import { useEffect, useRef } from 'react';

interface UseDrawerA11yOptions {
  isOpen: boolean;
  onClose: () => void;
}

export function useDrawerA11y<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onClose,
}: UseDrawerA11yOptions) {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Lock background scroll
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 2. Escape key listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // 3. Focus trapping within containerRef
      if (e.key === 'Tab' && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Focus the first element on mount
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const firstInput = containerRef.current.querySelector<HTMLElement>(
          'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstInput?.focus();
      }
    }, 50);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  return containerRef;
}
