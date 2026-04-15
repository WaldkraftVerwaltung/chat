'use client';

import { useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useCallStore } from '@/stores/call.store';
import { useToast } from '@/components/ui/Toast';

/**
 * Globaler Event-Listener: Hört auf `window.dispatchEvent('start-call', { channelId, mediaType })`
 * und initiiert über das Backend einen LiveKit-Call.
 */
export function CallLauncher() {
  const setActive = useCallStore((s) => s.setActive);
  const { addToast } = useToast();

  useEffect(() => {
    async function handleStartCall(e: Event) {
      const detail = (e as CustomEvent).detail as { channelId: string; mediaType: 'video' | 'audio' };
      if (!detail?.channelId) return;

      try {
        const result = await apiFetch<any>(`/calls/channels/${detail.channelId}/start`, {
          method: 'POST',
        });

        setActive({
          channelId: detail.channelId,
          room: result.room,
          token: result.token,
          url: result.url,
          mediaType: detail.mediaType,
          startedAt: new Date().toISOString(),
        });
      } catch (err: any) {
        console.error('Call start error:', err);
        addToast('Anruf konnte nicht gestartet werden: ' + (err?.message || 'Unbekannter Fehler'), 'error');
      }
    }

    window.addEventListener('start-call', handleStartCall as EventListener);
    return () => window.removeEventListener('start-call', handleStartCall as EventListener);
  }, [setActive, addToast]);

  return null;
}
