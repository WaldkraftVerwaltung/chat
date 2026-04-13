'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ChannelHeader } from '@/components/channel/ChannelHeader';
import { MessageList } from '@/components/channel/MessageList';
import { MessageInput } from '@/components/channel/MessageInput';
import { useChannelsStore } from '@/stores/channels.store';
import { useChannelSocket } from '@/hooks/useSocket';

export default function ChannelPage() {
  const params = useParams();
  const channelId = params.channelId as string;
  const { channels, setActiveChannel } = useChannelsStore();
  const channel = channels.find((c) => c.id === channelId);

  useChannelSocket(channelId);
  useEffect(() => { setActiveChannel(channelId); }, [channelId, setActiveChannel]);

  if (!channel) return <div className="flex flex-1 items-center justify-center text-gray-400">Channel wird geladen...</div>;

  return (
    <div className="flex flex-1 flex-col">
      <ChannelHeader name={channel.name} topic={channel.topic} type={channel.type} />
      <MessageList channelId={channelId} />
      <MessageInput channelId={channelId} />
    </div>
  );
}
