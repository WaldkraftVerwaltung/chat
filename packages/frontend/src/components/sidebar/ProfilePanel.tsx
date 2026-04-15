'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { usePresenceStore } from '@/stores/presence.store';
import { apiFetch } from '@/lib/api';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStatus: () => void;
}

export function ProfilePanel({ isOpen, onClose, onOpenStatus }: ProfilePanelProps) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const presence = usePresenceStore((s) => s.presenceMap[user?.id || ''] || 'active');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ displayName: '', fullName: '', title: '', phone: '' });

  useEffect(() => {
    if (user) {
      setEditData({
        displayName: user.displayName || '',
        fullName: (user as any).fullName || '',
        title: (user as any).title || '',
        phone: (user as any).phone || '',
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const presenceLabel = { active: 'Aktiv', away: 'Abwesend', dnd: 'Nicht stören' }[presence];
  const now = new Date();
  const localTime = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  async function saveProfile() {
    try {
      const updated = await apiFetch<any>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(editData),
      });
      setUser({ ...user!, ...updated });
      setIsEditing(false);
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-96 h-full bg-white shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Profil</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        {/* Avatar */}
        <div className="flex justify-center py-6 bg-gray-50">
          {(user as any).avatarUrl ? (
            <img src={(user as any).avatarUrl} alt={user.displayName} className="w-48 h-48 rounded-lg object-cover" />
          ) : (
            <div className="w-48 h-48 rounded-lg bg-gray-300 flex items-center justify-center text-6xl font-bold text-gray-500">
              {user.displayName?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Name section */}
        <div className="px-5 py-4">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Anzeigename</label>
                <input
                  value={editData.displayName}
                  onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                  className="w-full rounded border px-3 py-1.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Vollständiger Name</label>
                <input
                  value={editData.fullName}
                  onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                  className="w-full rounded border px-3 py-1.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Titel</label>
                <input
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full rounded border px-3 py-1.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={saveProfile}
                  className="px-3 py-1.5 text-sm rounded bg-slack-green text-white hover:bg-slack-green-hover"
                >
                  Speichern
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{user.displayName}</h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-blue-700 hover:underline font-medium"
                >
                  Bearbeiten
                </button>
              </div>
              {(user as any).title && (
                <p className="text-sm text-gray-500 mt-0.5">{(user as any).title}</p>
              )}
              <button className="text-sm text-blue-700 hover:underline mt-1">
                + Aussprache des Namens hinzufügen
              </button>
            </>
          )}
        </div>

        {/* Status & Presence */}
        <div className="px-5 py-2 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                presence === 'active' ? 'bg-green-500' : presence === 'dnd' ? 'bg-red-500' : 'bg-gray-400'
              }`}
            />
            <span>{presenceLabel}</span>
            {(user as any).dndEnabled && (
              <span className="text-gray-500">, Benachrichtigungen pausiert</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>🕐</span>
            <span>{localTime} Uhr Ortszeit</span>
          </div>
          {(user as any).statusEmoji && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>{(user as any).statusEmoji}</span>
              <span>{(user as any).statusText}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="px-5 py-3 flex gap-2">
          <button
            onClick={() => { onClose(); onOpenStatus(); }}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Status einstellen
          </button>
          <button className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-1">
            Ansicht als <span className="text-xs">▾</span>
          </button>
          <button className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">⋮</button>
        </div>

        {/* Contact info */}
        <div className="border-t px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold">Kontaktdaten</h4>
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-blue-700 hover:underline"
            >
              Bearbeiten
            </button>
          </div>
          <div className="flex items-start gap-3 mb-2">
            <span className="text-gray-400 mt-0.5">📧</span>
            <div>
              <p className="text-xs text-gray-500">E-Mail-Adresse</p>
              <p className="text-sm text-blue-700">{user.email}</p>
            </div>
          </div>
          {(user as any).phone ? (
            <div className="flex items-start gap-3">
              <span className="text-gray-400">📱</span>
              <div>
                <p className="text-xs text-gray-500">Telefon</p>
                <p className="text-sm">{(user as any).phone}</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-blue-700 hover:underline"
            >
              + Telefon hinzufügen
            </button>
          )}
        </div>

        {/* Info about me */}
        <div className="border-t px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold">Info ueber mich</h4>
            <button className="text-sm text-blue-700 hover:underline">Bearbeiten</button>
          </div>
          <button className="text-sm text-blue-700 hover:underline">
            + Anfangsdatum hinzufügen
          </button>
        </div>
      </div>
    </div>
  );
}
