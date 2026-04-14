'use client';
import { useState, useRef, useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth.store';
import { EmojiPicker } from './EmojiPicker';

interface ReactionBarProps {
  messageId: string;
  channelId: string;
  reactions: { emoji: string; count: number; userIds: string[] }[];
}

export function ReactionBar({ messageId, channelId, reactions }: ReactionBarProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const [showPicker, setShowPicker] = useState(false);
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  function toggleReaction(emojiCode: string) {
    getSocket().emit('reaction:toggle', { messageId, emojiCode, channelId });
    setShowPicker(false);
  }

  if (reactions.length === 0 && !showPicker) {
    return null;
  }

  return (
    <div className="relative flex items-center gap-1 mt-1 flex-wrap">
      {reactions.map((r) => {
        const isMine = r.userIds.includes(userId || '');
        return (
          <div key={r.emoji} className="relative">
            <button
              onClick={() => toggleReaction(r.emoji)}
              onMouseEnter={() => setHoveredEmoji(r.emoji)}
              onMouseLeave={() => setHoveredEmoji(null)}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-all duration-150 ${
                isMine
                  ? 'border-slack-blue/30 bg-slack-mention-bg text-slack-blue hover:bg-slack-mention-bg/80'
                  : 'border-slack-border bg-gray-50 text-slack-gray-text hover:bg-slack-msg-hover'
              }`}
            >
              <span className="transition-transform duration-150 hover:scale-110">{r.emoji}</span>
              <span>{r.count}</span>
            </button>
            {/* Tooltip */}
            {hoveredEmoji === r.emoji && r.count > 0 && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg z-20 pointer-events-none">
                {`${r.count} Reaktion${r.count > 1 ? 'en' : ''}`}
                <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
              </div>
            )}
          </div>
        );
      })}
      <div className="relative" ref={pickerRef}>
        <button
          id={`reaction-picker-${messageId}`}
          onClick={() => setShowPicker(!showPicker)}
          className="rounded-full border border-dashed border-slack-input-border px-2 py-0.5 text-xs text-slack-gray-text hover:bg-slack-msg-hover hover:border-slack-gray-text transition-colors"
        >
          +
        </button>
        {showPicker && (
          <div className="absolute bottom-full left-0 mb-2 z-50">
            <EmojiPicker
              onSelect={(emoji) => toggleReaction(emoji)}
              onClose={() => setShowPicker(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
