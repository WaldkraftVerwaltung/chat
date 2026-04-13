'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useChannelsStore } from '@/stores/channels.store';

interface CreateChannelDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateChannelDialog({ isOpen, onClose }: CreateChannelDialogProps) {
  const router = useRouter();
  const fetchChannels = useChannelsStore((s) => s.fetchChannels);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'public' | 'private'>('public');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const channel = await apiFetch<any>('/channels', {
        method: 'POST',
        body: JSON.stringify({ name: name.toLowerCase().replace(/\s+/g, '-'), type, description }),
      });
      await fetchChannels();
      onClose();
      setName('');
      setDescription('');
      router.push(`/channel/${channel.id}`);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Erstellen');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Channel erstellen</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <div className="flex items-center gap-1 rounded-md border px-3 py-2">
              <span className="text-gray-400">#</span>
              <input value={name} onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="z-b-marketing" className="flex-1 text-sm outline-none" required maxLength={80} />
            </div>
            <p className="text-xs text-gray-500 mt-1">Kleinbuchstaben, Zahlen und Bindestriche</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung (optional)</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Worum geht es in diesem Channel?" className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-indigo-500" maxLength={250} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sichtbarkeit</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="type" value="public" checked={type === 'public'} onChange={() => setType('public')} className="text-indigo-600" />
                <div>
                  <p className="text-sm font-medium"># Oeffentlich</p>
                  <p className="text-xs text-gray-500">Jeder kann beitreten und Nachrichten sehen</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="type" value="private" checked={type === 'private'} onChange={() => setType('private')} className="text-indigo-600" />
                <div>
                  <p className="text-sm font-medium">🔒 Privat</p>
                  <p className="text-xs text-gray-500">Nur eingeladene Mitglieder koennen beitreten</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Abbrechen</button>
            <button type="submit" disabled={loading || !name} className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Erstelle...' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
