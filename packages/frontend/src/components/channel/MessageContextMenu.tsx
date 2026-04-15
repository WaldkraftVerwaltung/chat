'use client';
import { useEffect, useRef } from 'react';

interface MessageContextMenuProps {
  x: number;
  y: number;
  isOwn: boolean;
  isPinned: boolean;
  onClose: () => void;
  onReplyInThread: () => void;
  onCopyLink: () => void;
  onCopyText: () => void;
  onPin: () => void;
  onMarkUnread: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onForward: () => void;
  onRemind: (minutes: number) => void;
  onSave: () => void;
}

export function MessageContextMenu({
  x, y, isOwn, isPinned, onClose,
  onReplyInThread, onCopyLink, onCopyText, onPin, onMarkUnread,
  onEdit, onDelete, onForward, onRemind, onSave,
}: MessageContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Adjust position if menu would overflow viewport
  const style: React.CSSProperties = {
    position: 'fixed',
    left: x,
    top: y,
    zIndex: 100,
  };

  const menuItems: { label: string; icon: string; onClick: () => void; danger?: boolean; divider?: boolean }[] = [
    { label: 'Im Thread antworten', icon: '💬', onClick: onReplyInThread },
    { label: 'Für später speichern', icon: '🔖', onClick: onSave },
    { label: 'An Channel weiterleiten...', icon: '↗️', onClick: onForward },
    { label: 'Link kopieren', icon: '🔗', onClick: onCopyLink },
    { label: 'Text kopieren', icon: '📋', onClick: onCopyText },
    { label: isPinned ? 'Losloesung aufheben' : 'Nachricht anpinnen', icon: '📌', onClick: onPin, divider: true },
    { label: 'Ab hier als ungelesen markieren', icon: '⊘', onClick: onMarkUnread },
    { label: 'Erinnere mich in 30 Min', icon: '⏰', onClick: () => onRemind(30) },
    { label: 'Erinnere mich in 1 Std', icon: '⏰', onClick: () => onRemind(60) },
    { label: 'Erinnere mich in 3 Std', icon: '⏰', onClick: () => onRemind(180) },
    { label: 'Erinnere mich morgen', icon: '⏰', onClick: () => onRemind(1440), divider: true },
  ];

  if (isOwn) {
    menuItems.push({ label: 'Bearbeiten', icon: '✏️', onClick: onEdit! });
    menuItems.push({ label: 'Löschen', icon: '🗑️', onClick: onDelete!, danger: true });
  }

  return (
    <div ref={ref} style={style} className="min-w-[220px] rounded-lg border bg-white py-1 shadow-xl">
      {menuItems.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => { item.onClick(); onClose(); }}
            className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-sm transition-colors ${
              item.danger
                ? 'text-red-600 hover:bg-red-50'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="w-5 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </button>
          {item.divider && <div className="my-1 border-t" />}
        </div>
      ))}
    </div>
  );
}
