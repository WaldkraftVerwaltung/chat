'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MessageList } from '@/components/channel/MessageList';
import { MessageInput } from '@/components/channel/MessageInput';
import { TypingIndicator } from '@/components/channel/TypingIndicator';
import { useDmsStore } from '@/stores/dms.store';
import { useAuthStore } from '@/stores/auth.store';
import { useChannelSocket } from '@/hooks/useSocket';

export default function DmPage() {
  const params = useParams();
  const dmId = params.dmId as string;
  const { conversations, fetchConversations } = useDmsStore();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const conv = conversations.find((c) => c.id === dmId);

  useChannelSocket(dmId);

  useEffect(() => {
    if (!conv) {
      fetchConversations();
    }
  }, [conv, fetchConversations]);

  const dmName = conv
    ? conv.participants
        ?.filter((p) => p.userId !== currentUserId)
        .map((p) => p.user?.displayName || 'Unbekannt')
        .join(', ') || 'Notizen'
    : 'Laden...';

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center gap-3 border-b bg-white px-5 py-3">
        <span className="text-gray-400 text-lg">@</span>
        <h1 className="text-base font-semibold text-gray-900">{dmName}</h1>
      </header>
      <MessageList channelId={dmId} />
      <TypingIndicator channelId={dmId} />
      <MessageInput channelId={dmId} />
    </div>
  );
}
