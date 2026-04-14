'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotificationsStore } from '@/stores/notifications.store';

const TYPE_LABELS: Record<string, string> = {
  mention: 'hat dich erwähnt',
  reaction: 'hat auf deine Nachricht reagiert',
  reply: 'hat auf deine Nachricht geantwortet',
  thread_reply: 'hat in einem Thread geantwortet',
  channel_join: 'ist einem Channel beigetreten',
};

const TYPE_ICONS: Record<string, string> = {
  mention: '@',
  reaction: '⚡',
  reply: '💬',
  thread_reply: '🧵',
  channel_join: '👋',
};

export default function ActivityPage() {
  const router = useRouter();
  const { notifications, fetch, markAllAsRead, markAsRead } = useNotificationsStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  function relTime(dateStr: string) {
    const d = new Date(dateStr);
    const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diffMin < 1) return 'Gerade eben';
    if (diffMin < 60) return `${diffMin} Min.`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} Std.`;
    return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  const unreadNotifs = notifications.filter((n) => !n.isRead);
  const readNotifs = notifications.filter((n) => n.isRead);

  return (
    <div className="flex flex-1 flex-col bg-white">
      {/* Header */}
      <div className="border-b px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Aktivität</h1>
          <p className="text-sm text-gray-500 mt-0.5">Erwähnungen, Reaktionen und Antworten</p>
        </div>
        {unreadNotifs.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Alle als gelesen markieren ({unreadNotifs.length})
          </button>
        )}
      </div>

      {/* Notifications */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">🔔</div>
            <p className="text-lg font-medium text-gray-700">Keine Aktivität</p>
            <p className="text-sm text-gray-500 mt-1">Hier erscheinen Erwähnungen, Reaktionen und Antworten.</p>
          </div>
        ) : (
          <div>
            {unreadNotifs.length > 0 && (
              <>
                <div className="px-8 py-3 bg-gray-50 border-b">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Neu</span>
                </div>
                {unreadNotifs.map((n) => (
                  <NotificationRow
                    key={n.id}
                    n={n}
                    relTime={relTime}
                    onRead={() => markAsRead([n.id])}
                    onNavigate={() => {
                      if (n.channelId) {
                        markAsRead([n.id]);
                        router.push(`/channel/${n.channelId}`);
                      }
                    }}
                  />
                ))}
              </>
            )}
            {readNotifs.length > 0 && (
              <>
                <div className="px-8 py-3 bg-gray-50 border-b">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Früher</span>
                </div>
                {readNotifs.map((n) => (
                  <NotificationRow
                    key={n.id}
                    n={n}
                    relTime={relTime}
                    onRead={() => {}}
                    onNavigate={() => {
                      if (n.channelId) router.push(`/channel/${n.channelId}`);
                    }}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationRow({
  n, relTime, onRead, onNavigate,
}: {
  n: { id: string; type: string; summary: string | null; channelId: string | null; actor?: { displayName: string }; channel?: { name: string }; isRead: boolean; createdAt: string };
  relTime: (d: string) => string;
  onRead: () => void;
  onNavigate: () => void;
}) {
  const icon = TYPE_ICONS[n.type] ?? '🔔';
  const label = TYPE_LABELS[n.type] ?? n.type;

  return (
    <div
      className={`flex items-start gap-4 px-8 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-50/30' : ''}`}
      onClick={onNavigate}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm">
            {n.actor?.displayName || 'System'}
          </span>
          <span className="text-sm text-gray-500">{label}</span>
          {n.channel?.name && (
            <span className="text-sm text-blue-600 font-medium">#{n.channel.name}</span>
          )}
        </div>
        {n.summary && (
          <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{n.summary}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">{relTime(n.createdAt)}</p>
      </div>

      {/* Unread indicator */}
      {!n.isRead && (
        <div className="flex-shrink-0 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <button
            onClick={(e) => { e.stopPropagation(); onRead(); }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Als gelesen
          </button>
        </div>
      )}
    </div>
  );
}
