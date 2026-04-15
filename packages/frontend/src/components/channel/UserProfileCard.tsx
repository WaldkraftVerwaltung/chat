'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePresenceStore } from '@/stores/presence.store';
import { useAuthStore } from '@/stores/auth.store';
import { useDmsStore } from '@/stores/dms.store';

interface UserProfileCardProps {
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    fullName?: string;
    title?: string;
    role?: string;
    statusEmoji?: string | null;
    statusText?: string | null;
    timezone?: string;
    email?: string;
  };
  position: { top: number; left: number };
  onClose: () => void;
}

export function UserProfileCard({ user, position, onClose }: UserProfileCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const presence = usePresenceStore((s) => s.presenceMap[user.id] || 'away');
  const currentUserId = useAuthStore((s) => s.user?.id);
  const startDm = useDmsStore((s) => s.startDm);
  const presenceLabel = { active: 'Aktiv', away: 'Abwesend', dnd: 'Nicht stören' }[presence];
  const presenceColor = { active: 'bg-green-500', away: 'bg-gray-400', dnd: 'bg-red-500' }[presence];
  const presenceRing = { active: 'ring-green-500', away: 'ring-gray-400', dnd: 'ring-red-500' }[presence];

  const roleLabel = {
    primary_owner: 'Workspace-Eigentuemer',
    owner: 'Workspace-Eigentuemer',
    admin: 'Workspace-Administrator',
    member: undefined,
    guest: 'Gast',
  }[user.role || 'member'];

  const now = new Date();
  const localTime = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const isOwnProfile = user.id === currentUserId;

  // Adjust position to stay within viewport
  const [adjustedPos, setAdjustedPos] = useState(position);
  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const newPos = { ...position };
      if (rect.right > window.innerWidth - 16) {
        newPos.left = window.innerWidth - rect.width - 16;
      }
      if (rect.bottom > window.innerHeight - 16) {
        newPos.top = position.top - rect.height - 10;
      }
      if (newPos.left < 16) newPos.left = 16;
      if (newPos.top < 16) newPos.top = 16;
      setAdjustedPos(newPos);
    }
  }, [position]);

  async function handleMessage() {
    if (isOwnProfile) return;
    try {
      const conv = await startDm([user.id]);
      onClose();
      router.push(`/dm/${conv.id}`);
    } catch {}
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div ref={ref} className="fixed z-50 w-80 rounded-xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
        style={{ top: adjustedPos.top, left: adjustedPos.left }}>

        {/* Role badge header */}
        {roleLabel && (
          <div className="bg-gray-50 border-b px-4 py-2">
            <span className="text-xs font-medium text-gray-600">{roleLabel}</span>
          </div>
        )}

        {/* Profile content */}
        <div className="p-4">
          {/* Avatar + Name row */}
          <div className="flex gap-3">
            <div className="relative flex-shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName}
                  className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600">
                  {user.displayName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-gray-900 truncate">{user.displayName}</h3>
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${presenceColor} flex-shrink-0`} />
              </div>
              {user.title && (
                <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{user.title}</p>
              )}
            </div>
          </div>

          {/* Status */}
          {user.statusEmoji && user.statusText && (
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-700">
              <span>{user.statusEmoji}</span>
              <span>{user.statusText}</span>
            </div>
          )}

          {/* Local time */}
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{localTime} Uhr Ortszeit</span>
          </div>

          {/* Action buttons */}
          {!isOwnProfile && (
            <div className="flex gap-2 mt-4">
              <button onClick={handleMessage}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Nachricht
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Huddle
                <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                title="Zur VIP-Liste hinzufügen">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                VIP
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
