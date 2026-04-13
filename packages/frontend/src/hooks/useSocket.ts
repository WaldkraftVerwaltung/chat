'use client';
import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useMessagesStore } from '@/stores/messages.store';
import { useThreadsStore } from '@/stores/threads.store';
import { useNotificationsStore } from '@/stores/notifications.store';
import { usePresenceStore } from '@/stores/presence.store';
import { useUnreadStore } from '@/stores/unread.store';
import { useChannelsStore } from '@/stores/channels.store';

export function useChannelSocket(channelId: string) {
  const addMessage = useMessagesStore((s) => s.addMessage);
  const updateMessage = useMessagesStore((s) => s.updateMessage);

  useEffect(() => {
    const socket = getSocket();
    socket.emit('channel:join', { channelId });

    const handleNewMessage = (message: any) => {
      const msgChannelId = message.channelId || message.channel_id;
      if (msgChannelId === channelId) {
        addMessage(channelId, message);
      } else if (msgChannelId) {
        useUnreadStore.getState().incrementUnread(msgChannelId);
      }
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

    const handleNotification = (data: any) => {
      useNotificationsStore.getState().addNotification(data);
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const title = data.actor?.displayName
          ? `${data.actor.displayName} hat dich erwähnt`
          : 'Neue Benachrichtigung';
        const body = data.summary || '';
        new Notification(title, { body });
      }
    };

    const handlePresenceUpdate = (data: { userId: string; presence: 'active' | 'away' | 'dnd' }) => {
      usePresenceStore.getState().setPresence(data.userId, data.presence);
    };

    socket.on('message:new', handleNewMessage);
    socket.on('reaction:add', handleReactionAdd);
    socket.on('reaction:remove', handleReactionRemove);
    socket.on('thread:reply', handleThreadReply);
    socket.on('notification', handleNotification);
    socket.on('presence:update', handlePresenceUpdate);

    return () => {
      socket.emit('channel:leave', { channelId });
      socket.off('message:new', handleNewMessage);
      socket.off('reaction:add', handleReactionAdd);
      socket.off('reaction:remove', handleReactionRemove);
      socket.off('thread:reply', handleThreadReply);
      socket.off('notification', handleNotification);
      socket.off('presence:update', handlePresenceUpdate);
    };
  }, [channelId, addMessage, updateMessage]);
}

export function useGlobalSocket() {
  useEffect(() => {
    const socket = getSocket();

    const handleNotification = (data: any) => {
      useNotificationsStore.getState().addNotification(data);
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const title = data.actor?.displayName
          ? `${data.actor.displayName} hat dich erwähnt`
          : 'Neue Benachrichtigung';
        const body = data.summary || '';
        new Notification(title, { body });
      }
    };

    const handlePresenceUpdate = (data: { userId: string; presence: 'active' | 'away' | 'dnd' }) => {
      usePresenceStore.getState().setPresence(data.userId, data.presence);
    };

    socket.on('notification', handleNotification);
    socket.on('presence:update', handlePresenceUpdate);

    const heartbeatInterval = setInterval(() => {
      socket.emit('presence:heartbeat');
    }, 60000);

    return () => {
      socket.off('notification', handleNotification);
      socket.off('presence:update', handlePresenceUpdate);
      clearInterval(heartbeatInterval);
    };
  }, []);
}
