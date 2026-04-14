'use client';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

interface ChannelSettingsDialogProps {
  channelId: string;
  channelName: string;
  topic: string | null;
  description: string | null;
  onClose: () => void;
  onUpdate?: (data: { topic?: string; description?: string }) => void;
}

export function ChannelSettingsDialog({ channelId, channelName, topic, description, onClose, onUpdate }: ChannelSettingsDialogProps) {
  const [editTopic, setEditTopic] = useState(topic || '');
  const [editDescription, setEditDescription] = useState(description || '');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  async function handleSave() {
    setSaving(true);
    try {
      await apiFetch(`/channels/${channelId}`, {
        method: 'PATCH',
        body: JSON.stringify({ topic: editTopic, description: editDescription }),
      });
      onUpdate?.({ topic: editTopic, description: editDescription });
      addToast('Channel-Einstellungen gespeichert', 'success');
      onClose();
    } catch {
      addToast('Fehler beim Speichern', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Einstellungen — #{channelName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Topic
            </label>
            <input
              type="text"
              value={editTopic}
              onChange={(e) => setEditTopic(e.target.value)}
              maxLength={250}
              placeholder="Worum geht es in diesem Channel?"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
            />
            <p className="text-xs text-gray-400 mt-1">{250 - editTopic.length} Zeichen uebrig</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Beschreibung
            </label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              maxLength={250}
              rows={3}
              placeholder="Beschreibe den Zweck dieses Channels..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{250 - editDescription.length} Zeichen uebrig</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
          >
            {saving ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}
