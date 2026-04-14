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

      // Cmd+Shift+S — Star/unstar active channel
      if (isMod && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        const channelsState = useChannelsStore.getState();
        const activeChannelId = channelsState.activeChannelId;
        if (activeChannelId) channelsState.toggleStar(activeChannelId);
        return;
      }

      // Cmd+Shift+M — Mute/unmute active channel
      if (isMod && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        const activeChannelId = useChannelsStore.getState().activeChannelId;
        if (activeChannelId) {
          const muted: string[] = JSON.parse(localStorage.getItem('mutedConversations') || '[]');
          const isMuted = muted.includes(activeChannelId);
          const updated = isMuted
            ? muted.filter((id) => id !== activeChannelId)
            : [...muted, activeChannelId];
          localStorage.setItem('mutedConversations', JSON.stringify(updated));
        }
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
