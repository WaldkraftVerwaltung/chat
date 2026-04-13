'use client';
import { useEffect } from 'react';
import { useSearchStore } from '@/stores/search.store';

export function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd+K — Quick Switcher / Search
      if (isMod && e.key === 'k') {
        e.preventDefault();
        useSearchStore.getState().open();
      }

      // Escape — close panels, mark channel as read
      if (e.key === 'Escape') {
        // SearchModal handles its own Escape
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
