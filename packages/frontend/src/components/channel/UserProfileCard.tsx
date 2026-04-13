'use client';
import { usePresenceStore } from '@/stores/presence.store';

interface UserProfileCardProps {
  user: { id: string; displayName: string; avatarUrl: string | null; fullName?: string; title?: string; timezone?: string };
  position: { top: number; left: number };
  onClose: () => void;
}

export function UserProfileCard({ user, position, onClose }: UserProfileCardProps) {
  const presence = usePresenceStore((s) => s.presenceMap[user.id] || 'away');
  const presenceLabel = { active: 'Aktiv', away: 'Abwesend', dnd: 'Nicht stoeren' }[presence];
  const presenceColor = { active: 'bg-green-500', away: 'bg-gray-400', dnd: 'bg-red-500' }[presence];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed z-50 w-72 rounded-lg bg-white shadow-2xl border" style={{ top: position.top, left: position.left }}>
        <div className="bg-slack-aubergine h-16 rounded-t-lg" />
        <div className="px-4 pb-4 -mt-8">
          <div className="relative">
            <div className="h-16 w-16 rounded-lg bg-gray-300 border-4 border-white flex items-center justify-center text-2xl font-bold text-gray-600">
              {user.displayName?.[0]?.toUpperCase() || '?'}
            </div>
            <span className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${presenceColor}`} />
          </div>
          <h3 className="text-lg font-bold mt-2">{user.displayName}</h3>
          {user.fullName && user.fullName !== user.displayName && <p className="text-sm text-gray-500">{user.fullName}</p>}
          {user.title && <p className="text-sm text-gray-500">{user.title}</p>}
          <div className="flex items-center gap-1 mt-1">
            <span className={`h-2 w-2 rounded-full ${presenceColor}`} />
            <span className="text-xs text-gray-500">{presenceLabel}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="flex-1 rounded bg-slack-green px-3 py-1.5 text-sm text-white hover:bg-slack-green-hover">Nachricht</button>
          </div>
        </div>
      </div>
    </>
  );
}
