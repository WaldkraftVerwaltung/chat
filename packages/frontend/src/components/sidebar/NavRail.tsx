'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotificationsStore } from '@/stores/notifications.store';
import { useDmsStore } from '@/stores/dms.store';
import { useAuthStore } from '@/stores/auth.store';
import { apiFetch } from '@/lib/api';
import { CreateMenu } from './CreateMenu';
import { NavRailPopup } from './NavRailPopup';

export type NavView = 'home' | 'dms' | 'channels' | 'activity' | 'threads' | 'later' | 'more';

interface NavRailProps {
  activeView: NavView;
  onViewChange: (view: NavView) => void;
  onCompose: () => void;
  onCreateChannel: () => void;
  onCreateDm: () => void;
  sidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const NAV_ITEMS: { id: NavView; label: string; icon: React.ReactNode }[] = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'dms',
    label: 'DMs',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    id: 'channels',
    label: 'Kanäle',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    ),
  },
  {
    id: 'activity',
    label: 'Aktivität',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    id: 'threads',
    label: 'Threads',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    id: 'later',
    label: 'Später',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
  {
    id: 'more',
    label: 'Mehr',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
    ),
  },
];

const NAV_ROUTES: Partial<Record<NavView, string>> = {
  threads: '/threads',
};

// IDs of items that get hover popups
const POPUP_IDS = new Set<NavView>(['activity', 'dms', 'later']);

export function NavRail({ activeView, onViewChange, onCompose, onCreateChannel, onCreateDm, sidebarCollapsed, onToggleCollapse }: NavRailProps) {
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const notifications = useNotificationsStore((s) => s.notifications);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const router = useRouter();

  // Hover popup state
  const [hoverItem, setHoverItem] = useState<NavView | null>(null);
  const [hoverPos, setHoverPos] = useState(0);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>();

  // Popup data
  const { conversations } = useDmsStore();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [savedItems, setSavedItems] = useState<any[]>([]);

  // Fetch notifications when activity popup opens
  useEffect(() => {
    if (hoverItem === 'activity' && notifications.length === 0) {
      useNotificationsStore.getState().fetch();
    }
  }, [hoverItem, notifications.length]);

  // Fetch saved items when later popup opens
  useEffect(() => {
    if (hoverItem === 'later') {
      apiFetch<any[]>('/saved-items').then(setSavedItems).catch(() => setSavedItems([]));
    }
  }, [hoverItem]);

  function handleNavHover(id: NavView, e: React.MouseEvent) {
    if (!POPUP_IDS.has(id)) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      setHoverItem(id);
      setHoverPos(rect.top);
    }, 300);
  }

  function handleNavLeave() {
    clearTimeout(hoverTimer.current);
    // Close popup after a short delay (allows mouse to move to popup)
    hoverTimer.current = setTimeout(() => setHoverItem(null), 400);
  }

  function closePopup() {
    clearTimeout(hoverTimer.current);
    setHoverItem(null);
  }

  function getDmPartnerName(conv: any) {
    if (!conv.participants) return 'Unbekannt';
    const other = conv.participants.find((p: any) => p.userId !== currentUserId);
    return other?.user?.displayName || other?.user?.email || 'Unbekannt';
  }

  return (
    <div className="flex h-full w-16 flex-col items-center bg-slack-aubergine-dark py-2 border-r border-black/20">
      {/* Workspace icon */}
      <div className="mb-1 cursor-pointer select-none">
        <img src="/workspace-logo.jpeg" alt="Waldkraft" className="h-9 w-9 rounded-lg object-cover" />
      </div>

      {/* Collapse / Expand sidebar button */}
      <button
        onClick={onToggleCollapse}
        title={sidebarCollapsed ? 'Sidebar einblenden' : 'Sidebar ausblenden'}
        className="mb-2 p-1.5 rounded hover:bg-white/10 text-slack-text transition-colors"
      >
        {sidebarCollapsed ? (
          // Expand icon (panel with arrow right)
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        ) : (
          // Collapse icon (panel with sidebar visible)
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v18" />
          </svg>
        )}
      </button>

      {/* Nav items */}
      <div className="flex-1 flex flex-col items-center gap-0.5 w-full px-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (NAV_ROUTES[item.id]) {
                router.push(NAV_ROUTES[item.id]!);
              } else {
                onViewChange(item.id);
              }
            }}
            onMouseEnter={(e) => handleNavHover(item.id, e)}
            onMouseLeave={handleNavLeave}
            title={item.label}
            className={`relative flex flex-col items-center justify-center w-full py-1.5 rounded-lg text-xs transition-colors ${
              activeView === item.id
                ? 'bg-white/20 text-white'
                : 'text-slack-text hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="leading-none">{item.icon}</span>
            <span className="text-[9px] mt-0.5 leading-none">{item.label}</span>
            {item.id === 'activity' && unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 h-4 min-w-4 rounded-full bg-slack-red text-white text-[10px] font-bold flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Compose / Create button */}
      <div className="relative mt-auto mb-2">
        <CreateMenu
          isOpen={showCreateMenu}
          onClose={() => setShowCreateMenu(false)}
          onCreateChannel={onCreateChannel}
          onCreateDm={onCreateDm}
        />
        <button
          onClick={() => setShowCreateMenu((v) => !v)}
          title="Erstellen"
          className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-white text-xl hover:bg-white/30 transition-colors"
        >
          +
        </button>
      </div>

      {/* ---- Hover Popups ---- */}

      {/* Activity Popup */}
      <NavRailPopup
        isVisible={hoverItem === 'activity'}
        onClose={closePopup}
        title="Aktivitaet"
        anchorTop={hoverPos}
        topRight={<span className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">Ungelesenes</span>}
      >
        {notifications.length === 0 ? (
          <p className="p-4 text-sm text-gray-500 text-center">Keine Aktivitaet</p>
        ) : (
          notifications.slice(0, 5).map((n) => (
            <div key={n.id} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>@ Erwaehnung in #{(n as any).channel?.name || 'channel'}</span>
                <span>{new Date(n.createdAt).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded bg-gray-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {(n as any).actor?.displayName?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900">{(n as any).actor?.displayName || 'System'}</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{n.summary}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </NavRailPopup>

      {/* DMs Popup */}
      <NavRailPopup
        isVisible={hoverItem === 'dms'}
        onClose={closePopup}
        title="Direktnachrichten"
        anchorTop={hoverPos}
        topRight={<span className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">Ungelesenes</span>}
      >
        {conversations.length === 0 ? (
          <p className="p-4 text-sm text-gray-500 text-center">Keine Direktnachrichten</p>
        ) : (
          conversations.slice(0, 5).map((conv: any) => (
            <div
              key={conv.id}
              onClick={() => { closePopup(); router.push(`/dm/${conv.id}`); }}
              className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded bg-purple-200 flex items-center justify-center text-xs font-bold flex-shrink-0 uppercase">
                {getDmPartnerName(conv)[0] || '?'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 truncate">{getDmPartnerName(conv)}</p>
                <p className="text-xs text-gray-500 truncate">{conv.lastMessage?.content || 'Keine Nachrichten'}</p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="h-5 min-w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 flex-shrink-0">
                  {conv.unreadCount}
                </span>
              )}
            </div>
          ))
        )}
      </NavRailPopup>

      {/* Later / Saved Popup */}
      <NavRailPopup
        isVisible={hoverItem === 'later'}
        onClose={closePopup}
        title="Spaeter"
        anchorTop={hoverPos}
        topRight={
          savedItems.length > 0
            ? <span className="text-xs text-gray-500">{savedItems.length} gespeichert</span>
            : undefined
        }
      >
        {savedItems.length === 0 ? (
          <p className="p-4 text-sm text-gray-500 text-center">Keine gespeicherten Nachrichten</p>
        ) : (
          savedItems.slice(0, 5).map((item: any) => (
            <div key={item.id} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded bg-yellow-200 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {item.message?.sender?.displayName?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900">{item.message?.sender?.displayName || 'Unbekannt'}</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{item.message?.content || 'Nachricht nicht gefunden'}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </NavRailPopup>
    </div>
  );
}
