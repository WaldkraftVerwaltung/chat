'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Room, RoomOptions, Participant, Track } from 'livekit-client';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  ScreenShareOff,
  Phone,
} from 'lucide-react';

interface Props {
  roomRef: React.MutableRefObject<Room | null>;
  token: string;
  url: string;
  channelId: string;
  mediaType: string;
  roomOptions: RoomOptions;
  onError: (error: string) => void;
  onEnd: () => void;
}

/**
 * Video call stage with grid layout and Google Meet-style controls.
 */
export function CallStage({
  roomRef,
  token,
  url,
  channelId,
  mediaType,
  roomOptions,
  onError,
  onEnd,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(mediaType === 'video');
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [toggling, setToggling] = useState<null | 'mic' | 'cam' | 'screen'>(null);
  const [connected, setConnected] = useState(false);

  // Initialize room connection
  useEffect(() => {
    const initRoom = async () => {
      try {
        const { Room } = await import('livekit-client');
        const room = new Room(roomOptions);
        roomRef.current = room;

        // Setup event listeners
        room.on('participantConnected', (participant) => {
          console.log('Participant connected:', participant.identity);
          participant.on('trackSubscribed', (track) => {
            console.log('Track subscribed:', track.kind);
            const element = document.createElement('video');
            element.autoplay = true;
            element.muted = false;
            element.playsInline = true;
            element.className = 'w-full h-full object-cover';
            const el = track.attach(element);
            videoRefs.current.set(`${participant.identity}-${track.sid}`, el);
            containerRef.current?.appendChild(el);
          });
          participant.on('trackUnsubscribed', (track) => {
            const el = videoRefs.current.get(`${participant.identity}-${track.sid}`);
            if (el) {
              track.detach(el);
              el.remove();
              videoRefs.current.delete(`${participant.identity}-${track.sid}`);
            }
          });
        });

        room.on('disconnected', onEnd);

        // Connect to room
        await room.connect(url, token);
        setConnected(true);

        // Publish local tracks
        if (cameraEnabled) {
          try {
            await room.localParticipant.setCameraEnabled(true);
          } catch (err) {
            console.error('Failed to enable camera:', err);
          }
        }
        if (micEnabled) {
          try {
            await room.localParticipant.setMicrophoneEnabled(true);
          } catch (err) {
            console.error('Failed to enable microphone:', err);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Failed to initialize room:', err);
        onError(`Connection error: ${message}`);
      }
    };

    initRoom();

    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, [token, url, cameraEnabled, micEnabled, roomOptions, onError, onEnd, roomRef]);

  const handleToggleMic = useCallback(async () => {
    if (toggling || !roomRef.current) return;
    setToggling('mic');
    try {
      await roomRef.current.localParticipant.setMicrophoneEnabled(!micEnabled);
      setMicEnabled(!micEnabled);
    } finally {
      setToggling(null);
    }
  }, [micEnabled, toggling]);

  const handleToggleCamera = useCallback(async () => {
    if (toggling || !roomRef.current) return;
    setToggling('cam');
    try {
      await roomRef.current.localParticipant.setCameraEnabled(!cameraEnabled);
      setCameraEnabled(!cameraEnabled);
    } finally {
      setToggling(null);
    }
  }, [cameraEnabled, toggling]);

  const handleToggleScreenShare = useCallback(async () => {
    if (toggling || !roomRef.current) return;
    setToggling('screen');
    try {
      await roomRef.current.localParticipant.setScreenShareEnabled(!screenShareEnabled);
      setScreenShareEnabled(!screenShareEnabled);
    } finally {
      setToggling(null);
    }
  }, [screenShareEnabled, toggling]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Video Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden bg-gray-900 grid grid-cols-2 gap-2 p-4 auto-rows-fr"
      >
        {!connected && (
          <div className="col-span-2 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Verbindung wird hergestellt...</p>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4 flex items-center justify-center gap-4">
        {/* Microphone */}
        <button
          onClick={handleToggleMic}
          disabled={toggling === 'mic' || !connected}
          title={micEnabled ? 'Mikrofon ausschalten' : 'Mikrofon einschalten'}
          className={`p-3 rounded-full transition-all ${
            micEnabled
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-red-600 text-white hover:bg-red-500'
          } disabled:opacity-50`}
        >
          {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        {/* Camera */}
        <button
          onClick={handleToggleCamera}
          disabled={toggling === 'cam' || !connected}
          title={cameraEnabled ? 'Kamera ausschalten' : 'Kamera einschalten'}
          className={`p-3 rounded-full transition-all ${
            cameraEnabled
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-red-600 text-white hover:bg-red-500'
          } disabled:opacity-50`}
        >
          {cameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        {/* Screen Share */}
        <button
          onClick={handleToggleScreenShare}
          disabled={toggling === 'screen' || !connected}
          title={
            screenShareEnabled
              ? 'Bildschirm nicht mehr freigeben'
              : 'Bildschirm freigeben'
          }
          className={`p-3 rounded-full transition-all ${
            screenShareEnabled
              ? 'bg-blue-600 text-white hover:bg-blue-500'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          } disabled:opacity-50`}
        >
          {screenShareEnabled ? (
            <ScreenShare size={20} />
          ) : (
            <ScreenShareOff size={20} />
          )}
        </button>

        {/* Hangup */}
        <button
          onClick={onEnd}
          title="Anruf beenden"
          className="p-3 rounded-full bg-red-600 text-white hover:bg-red-500 transition-all ml-4"
        >
          <Phone size={20} />
        </button>
      </div>
    </div>
  );
}
