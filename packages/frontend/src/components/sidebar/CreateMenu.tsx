'use client';
import { useRef, useEffect } from 'react';

interface CreateMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChannel: () => void;
  onCreateDm: () => void;
}

export function CreateMenu({ isOpen, onClose, onCreateChannel, onCreateDm }: CreateMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    {
      icon: '✏️',
      iconBg: 'bg-purple-100',
      title: 'Nachricht',
      subtitle: 'Unterhaltung in einer DM oder einem Channel',
      shortcut: '⌘N',
      onClick: () => { onClose(); onCreateDm(); },
    },
    {
      icon: '#',
      iconBg: 'bg-gray-200',
      title: 'Channel',
      subtitle: 'Gruppenunterhaltung nach Thema starten',
      shortcut: undefined,
      onClick: () => { onClose(); onCreateChannel(); },
    },
    {
      icon: '🎧',
      iconBg: 'bg-green-100',
      title: 'Huddle',
      subtitle: 'Video- oder Audio-Chat starten',
      shortcut: undefined,
      onClick: () => { onClose(); /* TODO: start huddle */ },
    },
  ];

  return (
    <div
      ref={ref}
      className="absolute bottom-16 left-2 w-80 rounded-xl bg-white shadow-2xl border border-gray-200 py-3 z-50"
    >
      <h3 className="px-5 pb-2 text-base font-bold text-gray-900">Erstellen</h3>

      {items.map((item) => (
        <button
          key={item.title}
          onClick={item.onClick}
          className="flex w-full items-center gap-3 px-5 py-2.5 hover:bg-gray-50 transition-colors"
        >
          <div className={`h-9 w-9 rounded-full ${item.iconBg} flex items-center justify-center text-lg`}>
            {item.icon}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-gray-900">{item.title}</p>
            <p className="text-xs text-gray-500">{item.subtitle}</p>
          </div>
          {item.shortcut && <span className="text-xs text-gray-400">{item.shortcut}</span>}
        </button>
      ))}

      <div className="border-t border-gray-100 my-1" />

      <button
        onClick={() => { onClose(); /* TODO: invite */ }}
        className="flex w-full items-center gap-3 px-5 py-2.5 hover:bg-gray-50 transition-colors"
      >
        <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-lg">👤</div>
        <p className="text-sm font-bold text-gray-900">Leute einladen</p>
      </button>
    </div>
  );
}
