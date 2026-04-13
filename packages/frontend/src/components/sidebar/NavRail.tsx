'use client';
import { useNotificationsStore } from '@/stores/notifications.store';

export type NavView = 'home' | 'dms' | 'channels' | 'activity' | 'threads' | 'later' | 'more';

interface NavRailProps {
  activeView: NavView;
  onViewChange: (view: NavView) => void;
  onCompose: () => void;
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

export function NavRail({ activeView, onViewChange, onCompose }: NavRailProps) {
  const unreadCount = useNotificationsStore((s) => s.unreadCount);

  return (
    <div className="flex h-full w-14 flex-col items-center bg-slack-aubergine-dark py-2 border-r border-black/20">
      {/* Workspace icon */}
      <div className="mb-3 h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:bg-white/30 transition-colors select-none">
        W
      </div>

      {/* Nav items */}
      <div className="flex-1 flex flex-col items-center gap-0.5 w-full px-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
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

      {/* Compose button */}
      <button
        onClick={onCompose}
        title="Neue Nachricht"
        className="mt-auto mb-2 h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-white text-xl hover:bg-white/30 transition-colors"
      >
        +
      </button>
    </div>
  );
}
