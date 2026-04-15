'use client';

import { useEffect, useState, useRef } from 'react';
import { Room } from 'livekit-client';
import { useCallStore } from '@/stores/call.store';
import { apiFetch } from '@/lib/api';
import { CallStage } from './CallStage';

/**
 * Fullscreen overlay that hosts the LiveKit room while a call is active.
 * Uses optimized HD video settings (720p @ 2 Mbps, VP9 codec, adaptive stream, dynacast).
 */
export function CallWindow() {
  const active = useCallStore((s) => s.active);
  const endActive = useCallStore((s) => s.endActive);
  const roomRef = useRef<Room | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const hangUp = async () => {
    if (!active) return;
    if (roomRef.current) {
      await roomRef.current.disconnect();
    }
    try {
      await apiFetch(`/calls/channels/${active.channelId}/end`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to notify backend of call end:', err);
    }
    endActive();
  };

  if (!active) return null;

  const roomOptions: any = {
    adaptiveStream: true,
    dynacast: true,
    publishDefaults: {
      videoCodec: 'vp9',
      simulcast: true,
      videoSimulcastLayers: [
        { width: 320, height: 180 },
        { width: 640, height: 360 },
        { width: 1280, height: 720 },
      ],
      screenShareEncoding: {
        maxBitrate: 3_000_000,
        maxFramerate: 30,
      },
    },
    videoCaptureDefaults: {
      resolution: { width: 1280, height: 720 },
      facingMode: 'user',
    },
    audioCaptureDefaults: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-gray-900">
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-500 text-white p-4 rounded z-10">
          {error}
        </div>
      )}
      <CallStage
        roomRef={roomRef}
        token={active.token}
        url={active.url}
        channelId={active.channelId}
        mediaType={active.mediaType}
        roomOptions={roomOptions}
        onError={setError}
        onEnd={hangUp}
      />
    </div>
  );
}
