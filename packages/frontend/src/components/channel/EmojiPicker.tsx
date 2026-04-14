'use client';
import { useState, useEffect, useRef, useMemo } from 'react';

const EMOJI_DATA: Record<string, string[]> = {
  'Haeufig': [],
  'Smileys': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🫡','🤐','🤨','😐','😑','😶','🫥','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','🫤','😟','🙁','😮','😯','😲','😳','🥺','🥹','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖'],
  'Gesten': ['👍','👎','👊','✊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✌️','🤞','🫰','🤟','🤘','👌','🤌','🤏','👈','👉','👆','👇','☝️','✋','🤚','🖐️','🖖','🫳','🫴','👋','🤙','💪','🦾','🖕','✍️','🫵'],
  'Herzen': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','❣️','💕','💞','💓','💗','💖','💘','💝'],
  'Objekte': ['🔥','⭐','✨','💯','✅','❌','⚠️','🚀','💡','🎉','🎊','🏆','🥇','📌','📎','🔗','💬','💭','🗨️','👀','👁️','🔔','🔕','📢','📣','💤','🏳️','🏴','🚩'],
};

const RECENT_KEY = 'recentEmojis';
const MAX_RECENT = 24;

function getRecentEmojis(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}

function addRecentEmoji(emoji: string) {
  const recent = getRecentEmojis();
  const next = [emoji, ...recent.filter((e) => e !== emoji)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Haeufig');
  const ref = useRef<HTMLDivElement>(null);

  const recentEmojis = useMemo(() => getRecentEmojis(), []);
  const categories = useMemo(() => {
    const data = { ...EMOJI_DATA, 'Haeufig': recentEmojis };
    if (recentEmojis.length === 0) {
      const { Haeufig: _, ...rest } = data;
      return rest;
    }
    return data;
  }, [recentEmojis]);

  // close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  function handleSelect(emoji: string) {
    addRecentEmoji(emoji);
    onSelect(emoji);
  }

  const allEmojis: string[] = (Object.values(categories) as string[][]).flat();

  const categoryKeys = Object.keys(categories);

  return (
    <div ref={ref} className="w-80 rounded-xl border border-slack-border bg-white shadow-xl z-50 overflow-hidden">
      {/* Search */}
      <div className="p-2 border-b border-slack-border">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Emoji suchen..."
          className="w-full rounded-md border border-slack-input-border px-3 py-1.5 text-sm outline-none focus:border-slack-blue"
          autoFocus
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-0.5 px-2 py-1 border-b border-slack-border overflow-x-auto">
        {categoryKeys.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setSearch(''); }}
            className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat ? 'bg-slack-mention-bg text-slack-blue' : 'text-slack-gray-text hover:bg-slack-msg-hover'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="h-56 overflow-y-auto p-2">
        {search ? (
          (() => {
            const filteredEmojis = allEmojis.filter((emoji) => emoji.includes(search));
            return filteredEmojis.length > 0 ? (
              <div className="grid grid-cols-8 gap-0.5">
                {filteredEmojis.map((emoji, i) => (
                  <button
                    key={`${emoji}-${i}`}
                    onClick={() => handleSelect(emoji)}
                    className="rounded p-1 text-xl hover:bg-slack-msg-hover transition-colors flex items-center justify-center"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slack-gray-text">
                Kein Emoji gefunden
              </div>
            );
          })()
        ) : (
          <>
            {categoryKeys.map((cat) => {
              const emojis = (categories as Record<string, string[]>)[cat];
              if (emojis.length === 0) return null;
              return (
                <div key={cat} className={cat === activeCategory ? '' : 'hidden'}>
                  <div className="grid grid-cols-8 gap-0.5">
                    {emojis.map((emoji, i) => (
                      <button
                        key={`${emoji}-${i}`}
                        onClick={() => handleSelect(emoji)}
                        className="rounded p-1 text-xl hover:bg-slack-msg-hover transition-colors flex items-center justify-center"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
