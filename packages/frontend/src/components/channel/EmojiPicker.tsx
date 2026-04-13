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

  const allEmojis = Object.values(categories).flat();
  const filtered = search
    ? allEmojis.filter(() => true) // unicode emojis can't be searched by name easily, show all and let user scroll
    : null;

  const categoryKeys = Object.keys(categories);

  return (
    <div ref={ref} className="w-80 rounded-xl border bg-white shadow-xl z-50 overflow-hidden">
      {/* Search */}
      <div className="p-2 border-b">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Emoji suchen..."
          className="w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
          autoFocus
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-0.5 px-2 py-1 border-b overflow-x-auto">
        {categoryKeys.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setSearch(''); }}
            className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="h-56 overflow-y-auto p-2">
        {search ? (
          <div className="grid grid-cols-8 gap-0.5">
            {allEmojis.map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                onClick={() => handleSelect(emoji)}
                className="rounded p-1 text-xl hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <>
            {categoryKeys.map((cat) => {
              const emojis = categories[cat];
              if (emojis.length === 0) return null;
              return (
                <div key={cat} className={cat === activeCategory ? '' : 'hidden'}>
                  <div className="grid grid-cols-8 gap-0.5">
                    {emojis.map((emoji, i) => (
                      <button
                        key={`${emoji}-${i}`}
                        onClick={() => handleSelect(emoji)}
                        className="rounded p-1 text-xl hover:bg-gray-100 transition-colors flex items-center justify-center"
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
