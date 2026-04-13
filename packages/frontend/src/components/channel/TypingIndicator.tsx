'use client';
import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth.store';

export function TypingIndicator({ channelId }: { channelId: string }) {
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const currentUserId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    const socket = getSocket();

    const handleStart = (data: { channelId: string; userId: string; displayName: string }) => {
      if (data.channelId !== channelId || data.userId === currentUserId) return;
      setTypingUsers((prev) => new Map(prev).set(data.userId, data.displayName));
      // Auto-remove after 5 seconds
      setTimeout(() => {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.delete(data.userId);
          return next;
        });
      }, 5000);
    };

    const handleStop = (data: { channelId: string; userId: string }) => {
      if (data.channelId !== channelId) return;
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(data.userId);
        return next;
      });
    };

    socket.on('typing:start', handleStart);
    socket.on('typing:stop', handleStop);
    return () => {
      socket.off('typing:start', handleStart);
      socket.off('typing:stop', handleStop);
    };
  }, [channelId, currentUserId]);

  const names = Array.from(typingUsers.values());
  if (names.length === 0) return <div className="h-5 px-5" />;

  let text = '';
  if (names.length === 1) text = `${names[0]} tippt...`;
  else if (names.length === 2) text = `${names[0]} und ${names[1]} tippen...`;
  else text = `${names.length} Personen tippen...`;

  return (
    <div className="h-5 px-5 text-xs text-gray-500 flex items-center gap-1">
      <span className="flex gap-0.5">
        <span className="animate-bounce w-1 h-1 bg-gray-400 rounded-full" style={{ animationDelay: '0ms' }} />
        <span className="animate-bounce w-1 h-1 bg-gray-400 rounded-full" style={{ animationDelay: '150ms' }} />
        <span className="animate-bounce w-1 h-1 bg-gray-400 rounded-full" style={{ animationDelay: '300ms' }} />
      </span>
      <span>{text}</span>
    </div>
  );
}
