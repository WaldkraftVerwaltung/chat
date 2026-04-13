'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useChannelsStore } from '@/stores/channels.store';

export function ChannelList() {
  const { channels, activeChannelId, fetchChannels } = useChannelsStore();
  useEffect(() => { fetchChannels(); }, [fetchChannels]);

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between px-3 py-1">
        <span className="text-xs font-semibold uppercase text-gray-500">Channels</span>
      </div>
      {channels.map((ch) => (
        <Link key={ch.id} href={`/channel/${ch.id}`}
          className={`flex items-center gap-2 rounded px-3 py-1 text-sm hover:bg-gray-100 ${activeChannelId === ch.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'}`}>
          <span className="text-gray-400">{ch.type === 'public' ? '#' : '\uD83D\uDD12'}</span>
          <span className="truncate">{ch.name}</span>
        </Link>
      ))}
    </div>
  );
}
