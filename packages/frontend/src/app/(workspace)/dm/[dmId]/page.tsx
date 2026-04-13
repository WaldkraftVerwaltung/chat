'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MessageList } from '@/components/channel/MessageList';
import { MessageInput } from '@/components/channel/MessageInput';
import { TypingIndicator } from '@/components/channel/TypingIndicator';
import { useDmsStore } from '@/stores/dms.store';
import { useAuthStore } from '@/stores/auth.store';
import { usePresenceStore } from '@/stores/presence.store';
import { useChannelSocket } from '@/hooks/useSocket';

function PresenceDot({ status }: { status: 'active' | 'away' | 'dnd' | undefined }) {
  const color =
    status === 'active' ? 'bg-green-500' :
    status === 'dnd' ? 'bg-red-500' :
    'bg-gray-400';
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${color} flex-shrink-0`} />;
}

export default function DmPage() {
  const params = useParams();
  const dmId = params.dmId as string;
  const { conversations, fetchConversations } = useDmsStore();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const presenceMap = usePresenceStore((s) => s.presenceMap);
  const conv = conversations.find((c) => c.id === dmId);

  useChannelSocket(dmId);

  useEffect(() => {
    if (!conv) {
      fetchConversations();
    }
  }, [conv, fetchConversations]);

  const otherParticipants = conv
    ? conv.participants?.filter((p) => p.userId !== currentUserId)
    : [];

  const isSelfNote = otherParticipants.length === 0;
  const otherUser = otherParticipants[0]?.user ?? null;

  const dmName = conv
    ? isSelfNote
      ? 'Notizen'
      : otherParticipants.map((p) => p.user?.displayName || 'Unbekannt').join(', ')
    : 'Laden...';

  const avatarUrl = otherUser?.avatarUrl ?? null;
  const initials = otherUser?.displayName?.[0]?.toUpperCase() ?? '?';
  const presence = otherUser ? presenceMap[otherUser.id] : undefined;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center gap-3 border-b bg-white px-5 py-3">
        {/* Avatar with presence dot */}
        <div className="relative flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={dmName}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slack-mention-bg flex items-center justify-center text-sm font-semibold text-slack-blue">
              {isSelfNote ? '📝' : initials}
            </div>
          )}
          {!isSelfNote && (
            <span className="absolute bottom-0 right-0 translate-x-0.5 translate-y-0.5">
              <PresenceDot status={presence} />
            </span>
          )}
        </div>

        <div className="min-w-0">
          <h1 className="text-base font-semibold text-gray-900 leading-tight">{dmName}</h1>
          {!isSelfNote && presence && (
            <p className="text-xs text-gray-500 leading-tight capitalize">
              {presence === 'active' ? 'Online' : presence === 'dnd' ? 'Bitte nicht stören' : 'Abwesend'}
            </p>
          )}
        </div>
      </header>
      <MessageList channelId={dmId} />
      <TypingIndicator channelId={dmId} />
      <MessageInput channelId={dmId} />
    </div>
  );
}
