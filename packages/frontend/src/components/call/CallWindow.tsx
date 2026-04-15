'use client';

import { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import {
  RoomOptions,
  VideoPresets,
  VideoCodec,
} from 'livekit-client';
import { useCallStore } from '@/stores/call.store';
import { apiFetch } from '@/lib/api';
import { CallStage } from './CallStage';

/**
 * Fullscreen overlay that hosts the LiveKit room while a call is active.
 * Uses optimized HD video settings (720p @ 2 Mbps, VP9 codec, adaptive stream,
 * dynacast) for the best possible quality.
 */
export function CallWindow() {
  const active = useCallStore((s) => s.active);
  const endActive = useCallStore((s) => s.endActive);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  if (!active) return null;

  function hangUp() {
    if (!active) return;
    // Notify backend: end call
    apiFetch(`/calls/channels/${active.channelId}/end`, { method: 'POST' }).catch(() => {});
    endActive();
  }

  // ── HD Quality room options ─────────────────────────────────────
  const roomOptions: RoomOptions = {
    adaptiveStream: true,
    dynacast: true,
    publishDefaults: {
      // Use VP9 for better quality at same bitrate (falls back to VP8/H.264)
      videoCodec: 'vp9' as VideoCodec,
      // Simulcast: publish multiple qualities so receivers can pick best
      simulcast: true,
      videoSimulcastLayers: [
        VideoPresets.h180,
        VideoPresets.h360,
        VideoPresets.h720,
      ],
      // Screen share: full HD
      screenShareEncoding: {
        maxBitrate: 3_000_000, // 3 Mbps
        maxFramerate: 30,
      },
    },
    videoCaptureDefaults: {
      // Default camera to 720p @ 30fps
      resolution: VideoPresets.h720.resolution,
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
      <LiveKitRoom
        serverUrl={active.url}
        token={active.token}
        connect
        video={active.mediaType === 'video'}
        audio={true}
        options={roomOptions}
        onDisconnected={hangUp}
        className="flex flex-1 min-h-0"
      >
        <CallStage
          channelId={active.channelId}
          onEnd={hangUp}
        />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}
