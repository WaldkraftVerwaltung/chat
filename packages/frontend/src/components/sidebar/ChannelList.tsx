'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useChannelsStore } from '@/stores/channels.store';
import { useUnreadStore } from '@/stores/unread.store';
import { SidebarSection } from './SidebarSection';
import { getSocket } from '@/lib/socket';
import { CreateChannelDialog } from '@/components/channel/CreateChannelDialog';

type SortMode = 'activity' | 'az';

function getSortMode(): SortMode {
  if (typeof window === 'undefined') return 'az';
  return (localStorage.getItem('channelSortMode') as SortMode) || 'az';
}

interface ChannelListProps {
  showSortToggle?: boolean;
}

export function ChannelList({ showSortToggle = false }: ChannelListProps) {
  const { channels, activeChannelId, fetchChannels, starredChannelIds, toggleStar, setActiveChannel } = useChannelsStore();
  const unreadByChannel = useUnreadStore((s) => s.unreadByChannel);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('az');

  useEffect(() => {
    setSortMode(getSortMode());
  }, []);

  useEffect(() => { fetchChannels(); }, [fetchChannels]);

  function handleSortChange(mode: SortMode) {
    setSortMode(mode);
    localStorage.setItem('channelSortMode', mode);
  }

  function sortChannels(chs: { id: string; name: string; type: string }[]) {
    if (sortMode === 'activity') {
      // Placeholder: sort by unread count descending (most active first), then alphabetically
      return [...chs].sort((a, b) => {
        const ua = unreadByChannel[a.id] || 0;
        const ub = unreadByChannel[b.id] || 0;
        if (ub !== ua) return ub - ua;
        return a.name.localeCompare(b.name, 'de');
      });
    }
    return [...chs].sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }

  const starredChannels = sortChannels(channels.filter((ch) => starredChannelIds.includes(ch.id)));
  const regularChannels = sortChannels(channels.filter((ch) => !starredChannelIds.includes(ch.id)));

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
        className={`group flex items-center gap-2 rounded px-3 py-1 text-sm transition-colors ${
          isActive
            ? 'bg-slack-active text-white font-medium'
            : unread > 0
            ? 'text-white font-semibold hover:bg-slack-aubergine-light'
            : 'text-slack-text hover:bg-slack-aubergine-light hover:text-slack-text-bright'
        }`}
      >
        <span className={isActive ? 'text-white/70' : 'text-slack-text/70'}>{ch.type === 'public' ? '#' : '\uD83D\uDD12'}</span>
        <span className="flex-1 truncate">{ch.name}</span>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleStar(ch.id); }}
          className={`transition-opacity text-yellow-300 text-xs ${isStarred ? 'opacity-100' : 'opacity-0 group-hover:opacity-40 hover:!opacity-100'}`}
          title={isStarred ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
        >
          {isStarred ? '★' : '☆'}
        </button>
        {unread > 0 && (
          <span className="rounded-full bg-slack-red px-1.5 py-0.5 text-[10px] text-white font-bold min-w-[18px] text-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </Link>
    );
  }

  return (
    <div className="space-y-0.5">
      {showSortToggle && (
        <div className="flex items-center gap-1 px-3 py-1.5">
          <span className="text-[10px] font-semibold uppercase text-slack-text mr-1">Sortierung</span>
          <button
            onClick={() => handleSortChange('activity')}
            className={`rounded px-2 py-0.5 text-[10px] font-semibold transition-colors ${
              sortMode === 'activity'
                ? 'bg-white/20 text-white'
                : 'text-slack-text hover:text-white'
            }`}
          >
            Aktiv
          </button>
          <button
            onClick={() => handleSortChange('az')}
            className={`rounded px-2 py-0.5 text-[10px] font-semibold transition-colors ${
              sortMode === 'az'
                ? 'bg-white/20 text-white'
                : 'text-slack-text hover:text-white'
            }`}
          >
            A-Z
          </button>
        </div>
      )}
      {starredChannels.length > 0 && (
        <SidebarSection title="Favoriten" badge={totalStarredUnread}>
          {starredChannels.map(renderChannel)}
        </SidebarSection>
      )}
      <div className="mb-1">
        <div className="flex items-center px-3 py-1">
          <button
            onClick={() => {
              const el = document.getElementById('channels-section-toggle');
              el?.click();
            }}
            className="flex flex-1 items-center gap-1 text-xs font-semibold uppercase text-slack-text hover:text-slack-text-bright"
          >
            <span className="text-[10px]">&#9654;</span>
            <span className="flex-1 text-left">Channels</span>
            {totalRegularUnread > 0 && (
              <span className="rounded-full bg-slack-red px-1.5 py-0.5 text-[10px] text-white font-bold">{totalRegularUnread}</span>
            )}
          </button>
          <button
            onClick={() => setShowCreateChannel(true)}
            className="ml-1 text-slack-text hover:text-slack-text-bright text-sm leading-none px-1"
            title="Channel erstellen"
          >
            +
          </button>
        </div>
        <div className="mt-0.5">
          {regularChannels.map(renderChannel)}
        </div>
      </div>
      <CreateChannelDialog isOpen={showCreateChannel} onClose={() => setShowCreateChannel(false)} />
    </div>
  );
}
