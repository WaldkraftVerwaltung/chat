'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface ThreadItem {
  parentMessage: {
    id: string;
    channelId: string | null;
    dmConversationId: string | null;
    content: string;
    createdAt: string;
    user?: { displayName: string };
  };
  replyCount: number;
  lastReply?: { content: string; createdAt: string; user?: { displayName: string } };
}

export function ThreadsView() {
  const router = useRouter();
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<ThreadItem[]>('/messages/threads')
      .then(setThreads)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function navigate(t: ThreadItem) {
    const id = t.parentMessage.channelId || t.parentMessage.dmConversationId;
    if (!id) return;
    const prefix = t.parentMessage.channelId ? 'channel' : 'dm';
    router.push(`/${prefix}/${id}?thread=${t.parentMessage.id}`);
  }

  function relTime(dateStr: string) {
    const d = new Date(dateStr);
    const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diffMin < 1) return 'Gerade eben';
    if (diffMin < 60) return `${diffMin} Min.`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} Std.`;
    return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 flex-shrink-0">
        <h2 className="text-sm font-semibold text-slack-text-bright">Threads</h2>
        <button
          onClick={() => router.push('/threads')}
          className="text-[10px] text-slack-text hover:text-white"
        >
          Alle anzeigen
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="px-3 py-4 text-xs text-slack-text">Laden...</p>
        ) : threads.length === 0 ? (
          <p className="px-3 py-4 text-xs text-slack-text">
            Du bist noch an keinen Threads beteiligt.
          </p>
        ) : (
          threads.slice(0, 20).map((t) => (
            <button
              key={t.parentMessage.id}
              onClick={() => navigate(t)}
              className="w-full text-left px-3 py-2 border-b border-white/5 hover:bg-slack-aubergine-light transition-colors"
            >
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded bg-gray-400 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5">
                  {t.parentMessage.user?.displayName?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-semibold text-slack-text-bright truncate">
                      {t.parentMessage.user?.displayName || 'Unbekannt'}
                    </span>
                    <span className="text-[10px] text-slack-text flex-shrink-0">
                      {relTime(t.parentMessage.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slack-text line-clamp-1 mt-0.5">
                    {t.parentMessage.content}
                  </p>
                  {t.lastReply && (
                    <p className="text-[10px] text-slack-text/70 mt-0.5">
                      {t.replyCount} Antwort{t.replyCount !== 1 ? 'en' : ''} · Letzte: {t.lastReply.user?.displayName}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
