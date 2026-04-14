'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUnreadStore } from '@/stores/unread.store';
import { useChannelsStore } from '@/stores/channels.store';
import { useDmsStore } from '@/stores/dms.store';
import { useAuthStore } from '@/stores/auth.store';

export default function UnreadPage() {
  const router = useRouter();
  const { unreadByChannel, fetchUnreadCounts, markChannelRead } = useUnreadStore();
  const channels = useChannelsStore((s) => s.channels);
  const { conversations } = useDmsStore();
  const currentUserId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    fetchUnreadCounts();
  }, [fetchUnreadCounts]);

  const unreadChannels = channels
    .filter((c) => (unreadByChannel[c.id] ?? 0) > 0)
    .sort((a, b) => (unreadByChannel[b.id] ?? 0) - (unreadByChannel[a.id] ?? 0));

  const unreadDms = conversations
    .filter((c: any) => (c.unreadCount ?? 0) > 0)
    .sort((a: any, b: any) => (b.unreadCount ?? 0) - (a.unreadCount ?? 0));

  const totalUnread = unreadChannels.reduce((acc, c) => acc + (unreadByChannel[c.id] ?? 0), 0)
    + unreadDms.reduce((acc: number, c: any) => acc + (c.unreadCount ?? 0), 0);

  function getDmName(conv: any) {
    if (!conv.participants) return 'Unbekannt';
    const other = conv.participants.find((p: any) => p.userId !== currentUserId);
    return other?.user?.displayName || other?.user?.email || 'Unbekannt';
  }

  function navigateToChannel(channelId: string) {
    markChannelRead(channelId);
    router.push(`/channel/${channelId}`);
  }

  function navigateToDm(dmId: string) {
    router.push(`/dm/${dmId}`);
  }

  return (
    <div className="flex flex-1 flex-col bg-white">
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Ungelesen</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {totalUnread > 0 ? `${totalUnread} ungelesene Nachrichten` : 'Alles gelesen'}
            </p>
          </div>
          {totalUnread > 0 && (
            <button
              onClick={() => {
                unreadChannels.forEach((c) => markChannelRead(c.id));
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Alle als gelesen markieren
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {totalUnread === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">✅</span>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Alles gelesen!</h2>
            <p className="text-sm text-gray-500 max-w-sm">
              Du hast keine ungelesenen Nachrichten. Super!
            </p>
          </div>
        ) : (
          <div>
            {unreadChannels.length > 0 && (
              <div>
                <div className="px-6 pt-4 pb-2">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Channels</h2>
                </div>
                {unreadChannels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => navigateToChannel(channel.id)}
                    className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-100 text-purple-700 font-bold text-sm flex-shrink-0">
                      #
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">#{channel.name}</p>
                      {channel.topic && (
                        <p className="text-xs text-gray-500 truncate">{channel.topic}</p>
                      )}
                    </div>
                    <span className="flex-shrink-0 h-5 min-w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center px-1.5">
                      {unreadByChannel[channel.id]}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {unreadDms.length > 0 && (
              <div>
                <div className="px-6 pt-4 pb-2">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Direktnachrichten</h2>
                </div>
                {unreadDms.map((conv: any) => (
                  <button
                    key={conv.id}
                    onClick={() => navigateToDm(conv.id)}
                    className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex-shrink-0">
                      {getDmName(conv)[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{getDmName(conv)}</p>
                      {conv.lastMessage?.content && (
                        <p className="text-xs text-gray-500 truncate">{conv.lastMessage.content}</p>
                      )}
                    </div>
                    <span className="flex-shrink-0 h-5 min-w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center px-1.5">
                      {conv.unreadCount}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
