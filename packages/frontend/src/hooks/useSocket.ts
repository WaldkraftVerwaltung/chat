'use client';
import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useMessagesStore } from '@/stores/messages.store';
import { useThreadsStore } from '@/stores/threads.store';

export function useChannelSocket(channelId: string) {
  const addMessage = useMessagesStore((s) => s.addMessage);
  const updateMessage = useMessagesStore((s) => s.updateMessage);

  useEffect(() => {
    const socket = getSocket();
    socket.emit('channel:join', { channelId });

    const handleNewMessage = (message: any) => {
      if (message.channelId === channelId || message.channel_id === channelId) addMessage(channelId, message);
    };

    const handleReactionAdd = (data: { messageId: string; emojiCode: string; userId: string }) => {
      const messages = useMessagesStore.getState().messagesByChannel;
      for (const chId of Object.keys(messages)) {
        const msg = messages[chId].find((m) => m.id === data.messageId);
        if (msg) {
          const reactions = [...(msg.reactions || [])];
          const existing = reactions.find((r) => r.emoji === data.emojiCode);
          if (existing) {
            if (!existing.userIds.includes(data.userId)) {
              const updated = reactions.map((r) =>
                r.emoji === data.emojiCode
                  ? { ...r, count: r.count + 1, userIds: [...r.userIds, data.userId] }
                  : r
              );
              updateMessage(data.messageId, { reactions: updated });
            }
          } else {
            updateMessage(data.messageId, { reactions: [...reactions, { emoji: data.emojiCode, count: 1, userIds: [data.userId] }] });
          }
          break;
        }
      }
    };

    const handleReactionRemove = (data: { messageId: string; emojiCode: string; userId: string }) => {
      const messages = useMessagesStore.getState().messagesByChannel;
      for (const chId of Object.keys(messages)) {
        const msg = messages[chId].find((m) => m.id === data.messageId);
        if (msg) {
          const reactions = (msg.reactions || [])
            .map((r) =>
              r.emoji === data.emojiCode
                ? { ...r, count: r.count - 1, userIds: r.userIds.filter((id) => id !== data.userId) }
                : r
            )
            .filter((r) => r.count > 0);
          updateMessage(data.messageId, { reactions });
          break;
        }
      }
    };

    const handleThreadReply = (data: { parentId: string; message: any }) => {
      useThreadsStore.getState().addReply(data.parentId, data.message);
    };

    socket.on('message:new', handleNewMessage);
    socket.on('reaction:add', handleReactionAdd);
    socket.on('reaction:remove', handleReactionRemove);
    socket.on('thread:reply', handleThreadReply);

    return () => {
      socket.emit('channel:leave', { channelId });
      socket.off('message:new', handleNewMessage);
      socket.off('reaction:add', handleReactionAdd);
      socket.off('reaction:remove', handleReactionRemove);
      socket.off('thread:reply', handleThreadReply);
    };
  }, [channelId, addMessage, updateMessage]);
}
