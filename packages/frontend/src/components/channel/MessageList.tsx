'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import React from 'react';
import { useMessagesStore } from '@/stores/messages.store';
import { MessageItem } from './MessageItem';

function DateSeparator({ date }: { date: string }) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let label: string;
  if (d.toDateString() === today.toDateString()) {
    label = 'Heute';
  } else if (d.toDateString() === yesterday.toDateString()) {
    label = 'Gestern';
  } else {
    label = d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  return (
    <div className="flex items-center gap-3 py-4 px-5">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

const GROUP_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export function MessageList({ channelId }: { channelId: string }) {
  const messages = useMessagesStore((s) => s.messagesByChannel[channelId] || []);
  const fetchMessages = useMessagesStore((s) => s.fetchMessages);
  const loading = useMessagesStore((s) => s.loading);
  const loadingMore = useMessagesStore((s) => s.loadingMore);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [unreadWhileScrolled, setUnreadWhileScrolled] = useState(0);
  const [fetchError, setFetchError] = useState(false);
  const prevLengthRef = useRef(messages.length);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    setFetchError(false);
    fetchMessages(channelId).catch(() => setFetchError(true));
  }, [channelId, fetchMessages]);

  // Scroll to bottom on initial load or when new messages arrive while at bottom
  useEffect(() => {
    const newCount = messages.length;
    const wasAtBottom = isAtBottomRef.current;

    if (newCount > prevLengthRef.current && !wasAtBottom) {
      // New messages arrived while user scrolled up
      setUnreadWhileScrolled((c) => c + (newCount - prevLengthRef.current));
    } else if (wasAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadWhileScrolled(0);
    }
    prevLengthRef.current = newCount;
  }, [messages.length]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom < 80;
    isAtBottomRef.current = atBottom;
    setShowScrollBtn(!atBottom);
    if (atBottom) setUnreadWhileScrolled(0);
    // Load older messages when scrolled to top
    if (el.scrollTop === 0 && messages.length > 0 && !loadingMore) {
      fetchMessages(channelId, messages[0].createdAt);
    }
  }, [channelId, fetchMessages, loadingMore, messages]);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setUnreadWhileScrolled(0);
  }

  if (fetchError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <p className="text-sm text-gray-500 mb-3">Nachrichten konnten nicht geladen werden.</p>
        <button
          onClick={() => { setFetchError(false); fetchMessages(channelId).catch(() => setFetchError(true)); }}
          className="rounded bg-slack-green px-3 py-1.5 text-sm text-white hover:bg-slack-green-hover"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (loading && messages.length === 0) return <div className="flex-1 flex items-center justify-center text-gray-400">Laden...</div>;

  if (!loading && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="text-4xl mb-3">👋</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Willkommen in diesem Channel!</h2>
        <p className="text-sm text-gray-500">Dies ist der Anfang der Konversation. Schreibe die erste Nachricht.</p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div ref={scrollRef} className="h-full overflow-y-auto" onScroll={handleScroll}>
        <div className="py-4">
          {loadingMore && (
            <div className="flex items-center justify-center py-2 text-xs text-gray-400">Aeltere Nachrichten werden geladen...</div>
          )}
          {messages.map((msg, i) => {
            const prev = i > 0 ? messages[i - 1] : null;
            const showDateSep = !prev || new Date(msg.createdAt).toDateString() !== new Date(prev.createdAt).toDateString();
            const isGrouped = !showDateSep
              && prev
              && !prev.isDeleted
              && !msg.isDeleted
              && prev.user?.id === msg.user?.id
              && (new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime()) < GROUP_THRESHOLD_MS;

            return (
              <React.Fragment key={msg.id}>
                {showDateSep && <DateSeparator date={msg.createdAt} />}
                <MessageItem message={msg} channelId={channelId} isGrouped={!!isGrouped} />
              </React.Fragment>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-slack-green px-3 py-2 text-xs font-medium text-white shadow-lg hover:bg-slack-green-hover transition-colors"
        >
          {unreadWhileScrolled > 0 && (
            <span className="bg-white text-slack-green rounded-full px-1.5 py-0.5 text-xs font-bold leading-none">
              {unreadWhileScrolled}
            </span>
          )}
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  );
}
