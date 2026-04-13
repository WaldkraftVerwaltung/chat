'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { usePresenceStore } from '@/stores/presence.store';
import { getSocket } from '@/lib/socket';
import { apiFetch } from '@/lib/api';
import { StatusDialog } from './StatusDialog';

export function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showDnd, setShowDnd] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const presence = usePresenceStore((s) => s.presenceMap[user?.id || ''] || 'active');
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowDnd(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const presenceLabel = { active: 'Aktiv', away: 'Abwesend', dnd: 'Nicht stoeren' }[presence];
  const presenceColor = { active: 'bg-green-500', away: 'bg-gray-400', dnd: 'bg-red-500' }[presence];
  const isAway = presence === 'away';

  async function togglePresence() {
    const newPresence = isAway ? 'active' : 'away';
    getSocket().emit('presence:set', { presence: newPresence });
    usePresenceStore.getState().setPresence(user!.id, newPresence as any);
    setIsOpen(false);
  }

  async function enableDnd(minutes: number) {
    const dndUntil = new Date(Date.now() + minutes * 60 * 1000);
    await apiFetch('/users/me', { method: 'PATCH', body: JSON.stringify({ dndEnabled: true, dndUntil }) });
    getSocket().emit('presence:set', { presence: 'dnd' });
    usePresenceStore.getState().setPresence(user!.id, 'dnd');
    setShowDnd(false);
    setIsOpen(false);
  }

  async function disableDnd() {
    await apiFetch('/users/me', { method: 'PATCH', body: JSON.stringify({ dndEnabled: false, dndUntil: null }) });
    getSocket().emit('presence:set', { presence: 'active' });
    usePresenceStore.getState().setPresence(user!.id, 'active');
    setShowDnd(false);
    setIsOpen(false);
  }

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      {/* Trigger: User footer */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 px-4 py-3 hover:bg-slack-aubergine-light transition-colors"
      >
        <div className="relative">
          <div className="h-9 w-9 rounded-lg bg-gray-400 flex items-center justify-center text-sm font-bold text-white">
            {user.displayName?.[0]?.toUpperCase() || '?'}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slack-aubergine ${presenceColor}`} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-slack-text-bright truncate">{user.displayName}</p>
          {(user as any).statusEmoji && (
            <p className="text-xs text-slack-text truncate">
              {(user as any).statusEmoji} {(user as any).statusText}
            </p>
          )}
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute bottom-full left-2 right-2 mb-1 rounded-lg bg-white shadow-2xl border border-gray-200 py-1 z-50 text-gray-900">
          {/* User info header */}
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-lg bg-gray-400 flex items-center justify-center text-lg font-bold text-white">
                {user.displayName?.[0]?.toUpperCase() || '?'}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${presenceColor}`} />
            </div>
            <div>
              <p className="font-bold text-gray-900">{user.displayName}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${presenceColor}`} />
                {presenceLabel}
              </p>
            </div>
          </div>

          {/* Status update */}
          <div className="px-2 py-1">
            <button
              onClick={() => { setIsOpen(false); setShowStatus(true); }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100"
            >
              <span>😊</span>
              <span className="text-gray-700">Deinen Status aktualisieren</span>
            </button>
          </div>

          <div className="border-t border-gray-100 my-1" />

          {/* Presence toggle */}
          <div className="px-2">
            <button
              onClick={togglePresence}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Setze dich auf <strong>{isAway ? 'aktiv' : 'abwesend'}</strong>
            </button>
          </div>

          {/* DND */}
          <div className="px-2 relative">
            <button
              onClick={() => setShowDnd(!showDnd)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <span>Benachrichtigungen pausieren</span>
              <span className="text-xs text-gray-400">{presence === 'dnd' ? 'An' : 'Aus'} ›</span>
            </button>

            {showDnd && (
              <div className="absolute left-full top-0 ml-1 w-52 rounded-lg bg-white shadow-xl border py-1 z-50">
                <button onClick={() => enableDnd(30)} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100">30 Minuten</button>
                <button onClick={() => enableDnd(60)} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100">1 Stunde</button>
                <button onClick={() => enableDnd(120)} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100">2 Stunden</button>
                <button onClick={() => enableDnd(720)} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100">Bis morgen</button>
                {presence === 'dnd' && (
                  <>
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={disableDnd} className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100">Pausierung aufheben</button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 my-1" />

          {/* Profile & Settings */}
          <div className="px-2">
            <button
              onClick={() => { setIsOpen(false); /* TODO: open profile */ }}
              className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Profil
            </button>
            <button
              onClick={() => { setIsOpen(false); router.push('/admin'); }}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <span>Persoenliche Einstellungen</span>
              <span className="text-xs text-gray-400">⌘,</span>
            </button>
          </div>

          <div className="border-t border-gray-100 my-1" />

          {/* Logout */}
          <div className="px-2">
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Abmelden
            </button>
          </div>
        </div>
      )}

      {/* Status dialog */}
      <StatusDialog isOpen={showStatus} onClose={() => setShowStatus(false)} />
    </div>
  );
}
