'use client';
import { useState, useEffect, useRef } from 'react';
import { useChannelsStore } from '@/stores/channels.store';
import { useDmsStore } from '@/stores/dms.store';
import { useAuthStore } from '@/stores/auth.store';
import { apiFetch } from '@/lib/api';

interface ForwardMessageDialogProps {
  messageContent: string;
  senderName: string;
  onClose: () => void;
}

export function ForwardMessageDialog({ messageContent, senderName, onClose }: ForwardMessageDialogProps) {
  const [query, setQuery] = useState('');
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'channel' | 'dm'>('channel');
  const inputRef = useRef<HTMLInputElement>(null);

  const channels = useChannelsStore((s) => s.channels);
  const conversations = useDmsStore((s) => s.conversations);
  const currentUserId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filteredChannels = channels
    .filter((c) => !c.isArchived && c.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  const filteredDms = conversations
    .filter((conv) => {
      const other = conv.participants?.find((p) => p.userId !== currentUserId);
      const name = other?.user?.displayName ?? 'Notizen';
      return name.toLowerCase().includes(query.toLowerCase());
    })
    .slice(0, 4);

  async function handleSend() {
    if (!selectedId) return;
    setSending(true);
    try {
      const forwardedText = comment
        ? `${comment}\n\n> *Weitergeleitet von ${senderName}:*\n> ${messageContent}`
        : `> *Weitergeleitet von ${senderName}:*\n> ${messageContent}`;

      // Both channels and DMs share the same message endpoint
      await apiFetch(`/channels/${selectedId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: forwardedText }),
      });
      setSent(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      console.error('Forward failed:', err);
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-bold text-gray-900">Nachricht weiterleiten</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Nachricht weitergeleitet an <span className="font-bold">{selectedName}</span></p>
          </div>
        ) : (
          <>
            {/* Message preview */}
            <div className="mx-5 mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">von {senderName}</p>
              <p className="text-sm text-gray-700 line-clamp-3">{messageContent}</p>
            </div>

            {/* Destination search */}
            <div className="px-5 pt-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">An wen weiterleiten?</label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedId(null); setSelectedName(null); }}
                  placeholder="Channel oder Person suchen..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slack-blue focus:ring-1 focus:ring-slack-blue"
                />
              </div>

              {/* Results */}
              {(filteredChannels.length > 0 || filteredDms.length > 0) && !selectedId && (
                <div className="mt-1 max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {filteredChannels.length > 0 && (
                    <>
                      <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">Channels</div>
                      {filteredChannels.map((ch) => (
                        <button
                          key={ch.id}
                          onClick={() => { setSelectedId(ch.id); setSelectedType('channel'); setSelectedName(`#${ch.name}`); setQuery(`#${ch.name}`); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <span className="text-gray-400">#</span>
                          <span>{ch.name}</span>
                        </button>
                      ))}
                    </>
                  )}
                  {filteredDms.length > 0 && (
                    <>
                      <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">Direktnachrichten</div>
                      {filteredDms.map((conv) => {
                        const other = conv.participants?.find((p) => p.userId !== currentUserId);
                        const name = other?.user?.displayName ?? 'Notizen';
                        return (
                          <button
                            key={conv.id}
                            onClick={() => { setSelectedId(conv.id); setSelectedType('dm'); setSelectedName(name); setQuery(name); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <span className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                              {name[0]?.toUpperCase()}
                            </span>
                            <span>{name}</span>
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Optional comment */}
            <div className="px-5 pt-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Kommentar hinzufügen (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Dein Kommentar..."
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slack-blue focus:ring-1 focus:ring-slack-blue resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 px-5 py-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSend}
                disabled={!selectedId || sending}
                className="px-4 py-2 text-sm font-medium text-white bg-slack-green hover:bg-slack-green-hover rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Weiterleiten...' : 'Weiterleiten'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
