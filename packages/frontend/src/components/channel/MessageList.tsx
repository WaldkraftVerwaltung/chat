'use client';
import { useEffect, useRef } from 'react';
import { useMessagesStore } from '@/stores/messages.store';
import { MessageItem } from './MessageItem';

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
        {messages.map((msg) => <MessageItem key={msg.id} message={msg} />)}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
