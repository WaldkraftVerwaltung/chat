'use client';
import { useEffect } from 'react';
import { useNotificationsStore } from '@/stores/notifications.store';

export function ActivityView() {
  const { notifications, fetch, markAllAsRead } = useNotificationsStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-sm font-semibold text-slack-text-bright">Aktivität</h2>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-slack-text hover:text-white transition-colors"
          >
            Alle gelesen
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <p className="px-3 py-4 text-sm text-slack-text">Keine neuen Benachrichtigungen</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className={`px-3 py-2 text-sm border-b border-white/5 ${
              n.isRead ? 'text-slack-text' : 'text-white bg-white/5'
            }`}
          >
            <p className="font-medium">{n.actor?.displayName || 'System'}</p>
            <p className="text-xs text-slack-text truncate">{n.summary || n.type}</p>
            <p className="text-xs text-slack-text mt-0.5">
              {new Date(n.createdAt).toLocaleString('de-DE', {
                hour: '2-digit',
                minute: '2-digit',
                day: 'numeric',
                month: 'short',
              })}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
