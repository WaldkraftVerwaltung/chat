'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChannelHeader } from '@/components/channel/ChannelHeader';
import { MessageList } from '@/components/channel/MessageList';
import { MessageInput } from '@/components/channel/MessageInput';
import { ThreadPanel } from '@/components/channel/ThreadPanel';
import { TypingIndicator } from '@/components/channel/TypingIndicator';
import { ChannelDetailsPanel } from '@/components/channel/ChannelDetailsPanel';
import { useChannelsStore } from '@/stores/channels.store';
import { useChannelSocket } from '@/hooks/useSocket';
import { useThreadsStore } from '@/stores/threads.store';

export default function ChannelPage() {
  const params = useParams();
  const channelId = params.channelId as string;
  const { channels, setActiveChannel } = useChannelsStore();
  const channel = channels.find((c) => c.id === channelId);
  const activeThreadId = useThreadsStore((s) => s.activeThreadId);
  const [showDetails, setShowDetails] = useState(false);

  useChannelSocket(channelId);
  useEffect(() => { setActiveChannel(channelId); }, [channelId, setActiveChannel]);

  if (!channel) return <div className="flex flex-1 items-center justify-center text-gray-400">Channel wird geladen...</div>;

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-1 flex-col">
        <ChannelHeader
          name={channel.name}
          topic={channel.topic}
          type={channel.type}
          onToggleDetails={() => setShowDetails((v) => !v)}
        />
        <MessageList channelId={channelId} />
        <TypingIndicator channelId={channelId} />
        <MessageInput channelId={channelId} />
      </div>
      {activeThreadId && <ThreadPanel channelId={channelId} />}
      {showDetails && !activeThreadId && (
        <ChannelDetailsPanel
          channelId={channelId}
          channelName={channel.name}
          topic={channel.topic ?? null}
          description={(channel as any).description ?? null}
          type={channel.type}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
}
