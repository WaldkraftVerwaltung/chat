'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/auth.store';

interface ChannelHeaderProps {
  channelId: string;
  name: string;
  topic: string | null;
  type: 'public' | 'private';
  memberCount?: number;
  isStarred?: boolean;
  onToggleStar?: () => void;
  onToggleDetails?: () => void;
  onToggleMembers?: () => void;
}

export function ChannelHeader({ channelId, name, topic, type, memberCount, isStarred, onToggleStar, onToggleDetails, onToggleMembers }: ChannelHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { addToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  async function handleLeave() {
    setMenuOpen(false);
    try {
      await apiFetch(`/channels/${channelId}/leave`, { method: 'POST' });
      addToast('Channel verlassen', 'success');
      router.push('/channel/general');
    } catch {
      addToast('Fehler beim Verlassen des Channels', 'error');
    }
  }

  async function handleArchive() {
    setMenuOpen(false);
    try {
      await apiFetch(`/channels/${channelId}/archive`, { method: 'POST' });
      addToast('Channel archiviert', 'success');
      router.push('/channel/general');
    } catch {
      addToast('Fehler beim Archivieren', 'error');
    }
  }

  return (
    <header className="flex items-center gap-3 border-b bg-white px-5 py-3">
      <span className="text-gray-400 text-lg">{type === 'public' ? '#' : '\uD83D\uDD12'}</span>
      <div className="min-w-0 flex-1">
        <button
          onClick={onToggleDetails}
          className={`text-base font-semibold text-gray-900 hover:underline text-left ${onToggleDetails ? 'cursor-pointer' : 'cursor-default'}`}
        >
          {name}
        </button>
        {topic && <p className="text-xs text-gray-500 truncate">{topic}</p>}
      </div>

      {/* Toolbar icons */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Star/Favorite */}
        {onToggleStar && (
          <button
            onClick={onToggleStar}
            title={isStarred ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufuegen'}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${isStarred ? 'text-yellow-500' : 'text-gray-400'}`}
          >
            {isStarred ? '★' : '☆'}
          </button>
        )}

        {/* Members */}
        <button
          onClick={onToggleMembers}
          title="Mitglieder"
          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-400 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          {memberCount !== undefined && <span className="text-xs">{memberCount}</span>}
        </button>

        {/* Pin */}
        <button title="Angepinnte Nachrichten" className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>

        {/* Search in channel */}
        <button title="In Channel suchen" className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* More options dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Mehr Optionen"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="4" cy="10" r="1.5" />
              <circle cx="10" cy="10" r="1.5" />
              <circle cx="16" cy="10" r="1.5" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 rounded-lg border border-gray-200 bg-white shadow-lg z-50 py-1">
              {onToggleDetails && (
                <button
                  onClick={() => { setMenuOpen(false); onToggleDetails(); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Channel-Details
                </button>
              )}
              {onToggleMembers && (
                <button
                  onClick={() => { setMenuOpen(false); onToggleMembers(); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Mitglieder anzeigen
                </button>
              )}
              <div className="my-1 border-t border-gray-100" />
              <button
                onClick={handleLeave}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Channel verlassen
              </button>
              {isAdmin && (
                <button
                  onClick={handleArchive}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Channel archivieren
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
