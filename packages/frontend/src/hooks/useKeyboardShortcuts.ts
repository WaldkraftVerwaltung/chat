'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchStore } from '@/stores/search.store';
import { useChannelsStore } from '@/stores/channels.store';
import { getSocket } from '@/lib/socket';

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      // Cmd+K — Quick Switcher / Search
      if (isMod && e.key === 'k') {
        e.preventDefault();
        useSearchStore.getState().open();
        return;
      }

      // Cmd+, — Personal Settings
      if (isMod && e.key === ',') {
        e.preventDefault();
        router.push('/settings');
        return;
      }

      // Cmd+Shift+J — Downloads / Files
      if (isMod && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        router.push('/files');
        return;
      }

      // Escape — close panels, mark active channel as read
      if (e.key === 'Escape') {
        const activeChannelId = useChannelsStore.getState().activeChannelId;
        if (activeChannelId) {
          getSocket().emit('mark:read', { channelId: activeChannelId });
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);
}
