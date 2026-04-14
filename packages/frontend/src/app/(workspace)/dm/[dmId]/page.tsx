'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MessageList } from '@/components/channel/MessageList';
import { MessageInput } from '@/components/channel/MessageInput';
import { TypingIndicator } from '@/components/channel/TypingIndicator';
import { ThreadPanel } from '@/components/channel/ThreadPanel';
import { DmHeaderMenu } from '@/components/channel/DmHeaderMenu';
import { MuteButton } from '@/components/channel/MuteButton';
import { useDmsStore } from '@/stores/dms.store';
import { useAuthStore } from '@/stores/auth.store';
import { usePresenceStore } from '@/stores/presence.store';
import { useChannelsStore } from '@/stores/channels.store';
import { useThreadsStore } from '@/stores/threads.store';
import { useSearchStore } from '@/stores/search.store';
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
  const activeThreadId = useThreadsStore((s) => s.activeThreadId);
  const conv = conversations.find((c) => c.id === dmId);
  const [showMenu, setShowMenu] = useState(false);

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

        <div className="min-w-0 flex-1">
          <h1 className="text-base font-semibold text-gray-900 leading-tight">{dmName}</h1>
          {!isSelfNote && presence && (
            <p className="text-xs text-gray-500 leading-tight capitalize">
              {presence === 'active' ? 'Online' : presence === 'dnd' ? 'Bitte nicht stoeren' : 'Abwesend'}
            </p>
          )}
        </div>

        {/* Header toolbar icons */}
        <div className="flex items-center gap-0.5 ml-auto">
          {/* Mute/Unmute notifications */}
          <MuteButton conversationId={dmId} />
          {/* Search */}
          <button onClick={() => useSearchStore.getState().open()} title="Suchen" className="p-2 rounded hover:bg-slack-msg-hover text-slack-gray-text">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
          {/* More menu */}
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} title="Mehr" className="p-2 rounded hover:bg-slack-msg-hover text-slack-gray-text">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" /></svg>
            </button>
            <DmHeaderMenu isOpen={showMenu} onClose={() => setShowMenu(false)}
              onShowDetails={() => {}} onShowProfile={() => {}}
              onToggleStar={() => useChannelsStore.getState().toggleStar(dmId)}
              onSearch={() => useSearchStore.getState().open()}
              isStarred={useChannelsStore.getState().starredChannelIds.includes(dmId)} />
          </div>
          {/* Close */}
          <button onClick={() => window.history.back()} title="Schliessen" className="p-2 rounded hover:bg-slack-msg-hover text-slack-gray-text">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </header>

      {/* Tabs bar */}
      <div className="flex items-center gap-4 border-b bg-white px-5 py-1.5">
        <button className="text-sm font-medium text-gray-900 border-b-2 border-slack-blue pb-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gray-900" />
          Nachrichten
        </button>
        <button className="text-sm text-gray-500 hover:text-gray-700 pb-1 flex items-center gap-1.5">
          Canvas hinzufuegen
        </button>
        <button className="text-sm text-gray-400 hover:text-gray-600 pb-1">+</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col">
          <MessageList channelId={dmId} />
          <TypingIndicator channelId={dmId} />
          <MessageInput channelId={dmId} channelName={dmName} />
        </div>
        {activeThreadId && <ThreadPanel channelId={dmId} />}
      </div>
    </div>
  );
}
