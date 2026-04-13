'use client';
import { useEffect, useRef } from 'react';
import { useMessagesStore } from '@/stores/messages.store';
import { MessageItem } from './MessageItem';

const GROUP_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export function MessageList({ channelId }: { channelId: string }) {
  const messages = useMessagesStore((s) => s.messagesByChannel[channelId] || []);
  const fetchMessages = useMessagesStore((s) => s.fetchMessages);
  const loading = useMessagesStore((s) => s.loading);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchMessages(channelId); }, [channelId, fetchMessages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  if (loading && messages.length === 0) return <div className="flex-1 flex items-center justify-center text-gray-400">Laden...</div>;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="py-4">
        {messages.map((msg, i) => {
          const prev = i > 0 ? messages[i - 1] : null;
          const isGrouped = prev
            && !prev.isDeleted
            && !msg.isDeleted
            && prev.user?.id === msg.user?.id
            && (new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime()) < GROUP_THRESHOLD_MS;

          return <MessageItem key={msg.id} message={msg} channelId={channelId} isGrouped={!!isGrouped} />;
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
