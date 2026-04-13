'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChannelsStore } from '@/stores/channels.store';

export default function WorkspacePage() {
  const router = useRouter();
  const channels = useChannelsStore((s) => s.channels);
  useEffect(() => {
    if (channels.length > 0) {
      const general = channels.find((c) => c.name === 'general');
      router.replace(`/channel/${general ? general.id : channels[0].id}`);
    }
  }, [channels, router]);
  return <div className="flex flex-1 items-center justify-center text-gray-400">Laden...</div>;
}
