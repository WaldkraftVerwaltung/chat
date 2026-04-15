'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { renderMrkdwn } from '@/lib/mrkdwn';

interface ThreadItem {
  parentMessage: {
    id: string;
    channelId: string | null;
    dmConversationId: string | null;
    content: string;
    createdAt: string;
    user?: { id: string; displayName: string; avatarUrl: string | null };
  };
  replyCount: number;
  lastReply?: {
    content: string;
    createdAt: string;
    user?: { id: string; displayName: string; avatarUrl: string | null };
  };
  lastReplyAt: string | null;
}

export default function ThreadsPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<ThreadItem[]>('/messages/threads')
      .then(setThreads)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function getTimeLabel(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
    if (diffDays === 1) return 'Gestern';
    if (diffDays < 7) return d.toLocaleDateString('de-DE', { weekday: 'short' });
    return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  }

  function navigateToThread(t: ThreadItem) {
    const channelOrDm = t.parentMessage.channelId || t.parentMessage.dmConversationId;
    if (channelOrDm) {
      const prefix = t.parentMessage.channelId ? 'channel' : 'dm';
      router.push(`/${prefix}/${channelOrDm}?thread=${t.parentMessage.id}`);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center">
        <p className="text-gray-400">Laden...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white">
      <div className="border-b px-6 py-4">
        <h1 className="text-lg font-bold">Threads</h1>
        <p className="text-sm text-gray-500 mt-1">Behalte den Überblick ueber Unterhaltungen, die dir wichtig sind.</p>
      </div>

      {threads.length === 0 ? (
        <div className="text-center py-16 px-6">
          <span className="text-5xl mb-4 block">🧵</span>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Threads an einem Ort</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Threads werden hier angezeigt, sobald du in einem Thread antwortest oder erwähnt wirst.
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {threads.map((t) => (
            <div key={t.parentMessage.id}
              onClick={() => navigateToThread(t)}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors">
              {/* Parent message */}
              <div className="flex items-start gap-3">
                <Avatar name={t.parentMessage.user?.displayName || '?'} avatarUrl={t.parentMessage.user?.avatarUrl} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{t.parentMessage.user?.displayName}</span>
                      <span className="text-xs text-gray-500">{getTimeLabel(t.parentMessage.createdAt)}</span>
                    </div>
                    <span className="text-xs text-gray-400">{t.replyCount} Antwort{t.replyCount !== 1 ? 'en' : ''}</span>
                  </div>
                  <p className="text-sm text-gray-800 mt-0.5 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: renderMrkdwn(t.parentMessage.content) }} />
                </div>
              </div>

              {/* Last reply */}
              {t.lastReply && (
                <div className="ml-12 mt-2 flex items-start gap-2 pl-3 border-l-2 border-gray-200">
                  <Avatar name={t.lastReply.user?.displayName || '?'} avatarUrl={t.lastReply.user?.avatarUrl} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700">{t.lastReply.user?.displayName}</span>
                      <span className="text-xs text-gray-400">{getTimeLabel(t.lastReply.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{t.lastReply.content}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
