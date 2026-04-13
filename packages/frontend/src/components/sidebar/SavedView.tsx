'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export function SavedView() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any[]>('/saved-items')
      .then(setItems)
      .catch(() => {});
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-3 py-2">
        <h2 className="text-sm font-semibold text-slack-text-bright">Später</h2>
      </div>
      {items.length === 0 ? (
        <p className="px-3 py-4 text-sm text-slack-text">
          Gespeicherte Nachrichten erscheinen hier. Klicke auf das Lesezeichen-Icon bei einer Nachricht.
        </p>
      ) : (
        items.map((item) => (
          <div key={item.id} className="px-3 py-2 text-sm text-white border-b border-white/5">
            <p className="text-xs text-slack-text">{item.status}</p>
          </div>
        ))
      )}
    </div>
  );
}
