'use client';
import { useState } from 'react';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth.store';

interface ReactionBarProps {
  messageId: string;
  channelId: string;
  reactions: { emoji: string; count: number; userIds: string[] }[];
}

const QUICK_EMOJI = ['👍','👎','❤️','😂','😮','😢','🎉','🔥','👀','✅','❌','💯','🚀','💪','🙏','👏'];

export function ReactionBar({ messageId, channelId, reactions }: ReactionBarProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const [showPicker, setShowPicker] = useState(false);

  function toggleReaction(emojiCode: string) {
    getSocket().emit('reaction:toggle', { messageId, emojiCode, channelId });
    setShowPicker(false);
  }

  if (reactions.length === 0 && !showPicker) {
    return null;
  }

  return (
    <div className="relative flex items-center gap-1 mt-1 flex-wrap">
      {reactions.map((r) => (
        <button key={r.emoji} onClick={() => toggleReaction(r.emoji)}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
            r.userIds.includes(userId || '') ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
          title={`${r.count} Reaktion${r.count > 1 ? 'en' : ''}`}>
          <span>{r.emoji}</span>
          <span>{r.count}</span>
        </button>
      ))}
      <button onClick={() => setShowPicker(!showPicker)} className="rounded-full border border-dashed border-gray-300 px-2 py-0.5 text-xs text-gray-400 hover:bg-gray-50">+</button>
      {showPicker && (
        <div className="absolute bottom-full left-0 z-10 mb-1 rounded-lg border bg-white p-2 shadow-lg">
          <div className="grid grid-cols-8 gap-1">
            {QUICK_EMOJI.map((emoji) => (
              <button key={emoji} onClick={() => toggleReaction(emoji)} className="rounded p-1 text-lg hover:bg-gray-100">{emoji}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
