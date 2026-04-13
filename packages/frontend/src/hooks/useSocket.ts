'use client';
import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useMessagesStore } from '@/stores/messages.store';

export function useChannelSocket(channelId: string) {
  const addMessage = useMessagesStore((s) => s.addMessage);
  useEffect(() => {
    const socket = getSocket();
    socket.emit('channel:join', { channelId });
    const handleNewMessage = (message: any) => {
      if (message.channelId === channelId || message.channel_id === channelId) addMessage(channelId, message);
    };
    socket.on('message:new', handleNewMessage);
    return () => { socket.emit('channel:leave', { channelId }); socket.off('message:new', handleNewMessage); };
  }, [channelId, addMessage]);
}
