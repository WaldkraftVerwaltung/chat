'use client';

import { useCallback, useState } from 'react';
import {
  useLocalParticipant,
  useRemoteParticipants,
  useTracks,
  useRoomContext,
  GridLayout,
  ParticipantTile,
  VideoTrack,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
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
  channelId: string;
  onEnd: () => void;
}

/**
 * Main call stage — video grid + toolbar with Google Meet-style controls:
 * mic/cam/screen share, and hangup.
 */
export function CallStage({ onEnd }: Props) {
  const room = useRoomContext();
  const {
    localParticipant,
    isMicrophoneEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
  } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();

  // Video tracks (camera + screen share)
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  // Separate screen share tracks from camera tracks
  const screenShareTracks = tracks.filter(
    (t) => t.source === Track.Source.ScreenShare && t.publication?.track,
  );
  const cameraTracks = tracks.filter(
    (t) => t.source !== Track.Source.ScreenShare,
  );
  const hasScreenShare = screenShareTracks.length > 0;

  // Toggle guard to prevent double-clicks during async transition
  const [toggling, setToggling] = useState<null | 'mic' | 'cam' | 'screen'>(null);

  // Mic toggle
  const handleToggleMic = useCallback(async () => {
    if (!localParticipant || toggling) return;
    setToggling('mic');
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } finally {
      setToggling(null);
    }
  }, [localParticipant, isMicrophoneEnabled, toggling]);

  // Camera toggle
  const handleToggleCamera = useCallback(async () => {
    if (!localParticipant || toggling) return;
    setToggling('cam');
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } finally {
      setToggling(null);
    }
  }, [localParticipant, isCameraEnabled, toggling]);

  // Screen share toggle
  const handleToggleScreenShare = useCallback(async () => {
    if (!localParticipant || toggling) return;
    setToggling('screen');
    try {
      await localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
    } finally {
      setToggling(null);
    }
  }, [localParticipant, isScreenShareEnabled, toggling]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Video Grid */}
      <div className="flex-1 overflow-hidden bg-gray-900">
        {hasScreenShare ? (
          // Screen share layout: large screen share + small video grid
          <div className="h-full flex gap-4 p-4">
            <div className="flex-1">
              {screenShareTracks.map((track) => (
                <VideoTrack key={track.trackSid} trackRef={track} />
              ))}
            </div>
            <div className="w-48 flex flex-col gap-2">
              {cameraTracks.map((track) => (
                <div key={track.trackSid} className="flex-1 min-h-0">
                  <ParticipantTile trackRef={track} />
                </div>
              ))}
              {remoteParticipants.map((participant) => (
                <div key={participant.identity} className="flex-1 min-h-0">
                  <ParticipantTile participant={participant} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Normal grid layout
          <GridLayout
            tracks={cameraTracks.concat(
              remoteParticipants.map((p) => ({
                participant: p,
                isScreenShare: false,
                isMirrored: false,
              })),
            )}
            style={{ height: '100%', width: '100%' }}
          >
            {cameraTracks.map((track) => (
              <ParticipantTile key={track.trackSid} trackRef={track} />
            ))}
            {remoteParticipants.map((participant) => (
              <ParticipantTile key={participant.identity} participant={participant} />
            ))}
          </GridLayout>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4 flex items-center justify-center gap-4">
        {/* Microphone */}
        <button
          onClick={handleToggleMic}
          disabled={toggling === 'mic'}
          title={isMicrophoneEnabled ? 'Mikrofon ausschalten' : 'Mikrofon einschalten'}
          className={`p-3 rounded-full transition-all ${
            isMicrophoneEnabled
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-red-600 text-white hover:bg-red-500'
          } disabled:opacity-50`}
        >
          {isMicrophoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        {/* Camera */}
        <button
          onClick={handleToggleCamera}
          disabled={toggling === 'cam'}
          title={isCameraEnabled ? 'Kamera ausschalten' : 'Kamera einschalten'}
          className={`p-3 rounded-full transition-all ${
            isCameraEnabled
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-red-600 text-white hover:bg-red-500'
          } disabled:opacity-50`}
        >
          {isCameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        {/* Screen Share */}
        <button
          onClick={handleToggleScreenShare}
          disabled={toggling === 'screen'}
          title={isScreenShareEnabled ? 'Bildschirm nicht mehr freigeben' : 'Bildschirm freigeben'}
          className={`p-3 rounded-full transition-all ${
            isScreenShareEnabled
              ? 'bg-blue-600 text-white hover:bg-blue-500'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          } disabled:opacity-50`}
        >
          {isScreenShareEnabled ? <ScreenShare size={20} /> : <ScreenShareOff size={20} />}
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
