'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchStore } from '@/stores/search.store';
import { useChannelsStore } from '@/stores/channels.store';

export function SearchModal() {
  const { isOpen, query, results, loading, totalHits, setQuery, search, close } = useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout>();

  const { channels, recentChannelIds, setActiveChannel } = useChannelsStore();

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useSearchStore.getState().open();
      }
      if (e.key === 'Escape') close();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close]);

  function handleInput(value: string) {
    setQuery(value);
    clearTimeout(debounceRef.current);
    if (value.length >= 3) {
      debounceRef.current = setTimeout(() => search(), 300);
    }
  }

  function navigateToResult(result: any) {
    if (result.channelId) router.push(`/channel/${result.channelId}`);
    close();
  }

  function navigateToChannel(channelId: string) {
    setActiveChannel(channelId);
    router.push(`/channel/${channelId}`);
    close();
  }

  if (!isOpen) return null;

  // Recent channels (last 5) — used when no query
  const recentChannels = recentChannelIds
    .slice(0, 5)
    .map((id) => channels.find((ch) => ch.id === id))
    .filter(Boolean) as typeof channels;

  // Fuzzy channel matches when query is typed
  const channelMatches = query.length > 0
    ? channels.filter((ch) => ch.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20" onClick={close}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input ref={inputRef} value={query} onChange={(e) => handleInput(e.target.value)}
            placeholder="Nachrichten durchsuchen... (from:@user in:#channel has:file)"
            className="flex-1 text-sm outline-none" />
          <kbd className="rounded border bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Esc</kbd>
        </div>

        {/* Empty query: show recent channels */}
        {!query && (
          <div className="max-h-96 overflow-y-auto">
            {recentChannels.length > 0 ? (
              <>
                <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Zuletzt besucht</p>
                {recentChannels.map((ch) => (
                  <button key={ch.id} onClick={() => navigateToChannel(ch.id)}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-800">
                    <span className="text-gray-400">#</span>
                    <span>{ch.name}</span>
                  </button>
                ))}
              </>
            ) : (
              <div className="px-4 py-4 text-xs text-gray-400 space-y-1">
                <p className="font-medium text-gray-500">Such-Tipps:</p>
                <p>from:@name — Nachrichten von Person</p>
                <p>in:#channel — In bestimmtem Channel</p>
                <p>has:file — Mit Dateianhang</p>
                <p>has:link — Mit Link</p>
                <p>before:2026-01-01 / after:2026-01-01</p>
              </div>
            )}
          </div>
        )}

        {/* Query typed: channel matches always shown first */}
        {query && channelMatches.length > 0 && (
          <>
            <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Channels</p>
            {channelMatches.map((ch) => (
              <button key={ch.id} onClick={() => navigateToChannel(ch.id)}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-800">
                <span className="text-gray-400">#</span>
                <span>{ch.name}</span>
              </button>
            ))}
          </>
        )}

        {/* Meilisearch results — only triggered for 3+ chars */}
        {query.length >= 3 && (
          <>
            {loading && <div className="px-4 py-3 text-sm text-gray-400">Suche...</div>}
            {!loading && results.length > 0 && (
              <div className="max-h-64 overflow-y-auto">
                <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Nachrichten <span className="font-normal normal-case">({totalHits})</span>
                </p>
                {results.map((r) => (
                  <button key={r.id} onClick={() => navigateToResult(r)}
                    className="flex w-full gap-3 px-4 py-2 text-left hover:bg-gray-50">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium text-gray-700">{r.userName}</span>
                        {r.channelName && <span>in #{r.channelName}</span>}
                        <span>{new Date(r.createdAt).toLocaleDateString('de-DE')}</span>
                      </div>
                      <p className="text-sm text-gray-800 truncate"
                        dangerouslySetInnerHTML={{ __html: r._formatted?.content || r.content }} />
                    </div>
                  </button>
                ))}
              </div>
            )}
            {!loading && results.length === 0 && channelMatches.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-gray-400">Keine Ergebnisse gefunden</div>
            )}
          </>
        )}

        {/* Short query (1-2 chars) with no channel matches */}
        {query.length > 0 && query.length < 3 && channelMatches.length === 0 && (
          <div className="px-4 py-3 text-sm text-gray-400">Mindestens 3 Zeichen für Nachrichtensuche</div>
        )}
      </div>
    </div>
  );
}
