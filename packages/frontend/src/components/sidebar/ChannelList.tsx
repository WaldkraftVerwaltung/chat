'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useChannelsStore } from '@/stores/channels.store';
import { useUnreadStore } from '@/stores/unread.store';
import { SidebarSection } from './SidebarSection';
import { getSocket } from '@/lib/socket';

export function ChannelList() {
  const { channels, activeChannelId, fetchChannels, starredChannelIds, toggleStar, setActiveChannel } = useChannelsStore();
  const unreadByChannel = useUnreadStore((s) => s.unreadByChannel);
  useEffect(() => { fetchChannels(); }, [fetchChannels]);

  const starredChannels = channels.filter((ch) => starredChannelIds.includes(ch.id));
  const regularChannels = channels.filter((ch) => !starredChannelIds.includes(ch.id));

  const totalStarredUnread = starredChannels.reduce((sum, ch) => sum + (unreadByChannel[ch.id] || 0), 0);
  const totalRegularUnread = regularChannels.reduce((sum, ch) => sum + (unreadByChannel[ch.id] || 0), 0);

  function handleChannelClick(channelId: string) {
    setActiveChannel(channelId);
    const socket = getSocket();
    socket.emit('mark:read', { channelId });
    useUnreadStore.getState().markChannelRead(channelId);
  }

  function renderChannel(ch: { id: string; name: string; type: string }) {
    const unread = unreadByChannel[ch.id] || 0;
    const isActive = activeChannelId === ch.id;
    const isStarred = starredChannelIds.includes(ch.id);
    return (
      <Link
        key={ch.id}
        href={`/channel/${ch.id}`}
        onClick={() => handleChannelClick(ch.id)}
        className={`group flex items-center gap-2 rounded px-3 py-1 text-sm hover:bg-gray-100 ${isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : unread > 0 ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}
      >
        <span className="text-gray-400">{ch.type === 'public' ? '#' : '\uD83D\uDD12'}</span>
        <span className="flex-1 truncate">{ch.name}</span>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleStar(ch.id); }}
          className={`transition-opacity text-yellow-400 text-xs ${isStarred ? 'opacity-100' : 'opacity-0 group-hover:opacity-50 hover:!opacity-100'}`}
          title={isStarred ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
        >
          {isStarred ? '★' : '☆'}
        </button>
        {unread > 0 && (
          <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white font-bold min-w-[18px] text-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </Link>
    );
  }

  return (
    <div className="space-y-0.5">
      {starredChannels.length > 0 && (
        <SidebarSection title="Favoriten" badge={totalStarredUnread}>
          {starredChannels.map(renderChannel)}
        </SidebarSection>
      )}
      <SidebarSection title="Channels" badge={totalRegularUnread}>
        {regularChannels.map(renderChannel)}
      </SidebarSection>
    </div>
  );
}
