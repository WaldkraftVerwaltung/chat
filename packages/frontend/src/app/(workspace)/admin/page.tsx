'use client';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';

interface WorkspaceSettings {
  whoCanCreateChannels?: string;
  whoCanArchiveChannels?: string;
  whoCanInviteMembers?: string;
  whoCanUploadEmoji?: string;
  whoCanUseAtChannel?: string;
  messageEditWindow?: number | null;
  messageDeletePolicy?: string;
}

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const [settings, setSettings] = useState<WorkspaceSettings>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<any>('/workspace').then((ws) => setSettings(ws.settings || {}));
  }, []);

  async function save() {
    setSaving(true);
    await apiFetch('/workspace', { method: 'PATCH', body: JSON.stringify({ settings }) });
    setSaving(false);
  }

  function updateSetting(key: string, value: string | number | null) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  const permOptions = [
    { key: 'whoCanCreateChannels', label: 'Wer darf Channels erstellen?' },
    { key: 'whoCanArchiveChannels', label: 'Wer darf Channels archivieren?' },
    { key: 'whoCanInviteMembers', label: 'Wer darf Mitglieder einladen?' },
    { key: 'whoCanUploadEmoji', label: 'Wer darf Custom Emoji hochladen?' },
    { key: 'whoCanUseAtChannel', label: 'Wer darf @channel/@here verwenden?' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Workspace-Einstellungen</h1>

      <div className="max-w-2xl space-y-6">
        <h2 className="text-lg font-semibold">Berechtigungen</h2>

        {permOptions.map((opt) => (
          <div key={opt.key} className="flex items-center justify-between border-b pb-3">
            <label className="text-sm font-medium">{opt.label}</label>
            <select value={(settings as any)[opt.key] || 'everyone'}
              onChange={(e) => updateSetting(opt.key, e.target.value)}
              className="rounded border px-3 py-1 text-sm">
              <option value="everyone">Alle</option>
              <option value="admins">Nur Admins</option>
              <option value="owners">Nur Owners</option>
            </select>
          </div>
        ))}

        <div className="flex items-center justify-between border-b pb-3">
          <label className="text-sm font-medium">Nachrichten bearbeiten (Zeitlimit)</label>
          <select value={settings.messageEditWindow === null ? 'unlimited' : String(settings.messageEditWindow || 'unlimited')}
            onChange={(e) => updateSetting('messageEditWindow', e.target.value === 'unlimited' ? null : parseInt(e.target.value))}
            className="rounded border px-3 py-1 text-sm">
            <option value="unlimited">Unbegrenzt</option>
            <option value="1">1 Minute</option>
            <option value="5">5 Minuten</option>
            <option value="30">30 Minuten</option>
            <option value="60">1 Stunde</option>
            <option value="1440">24 Stunden</option>
          </select>
        </div>

        <div className="flex items-center justify-between border-b pb-3">
          <label className="text-sm font-medium">Nachrichten loeschen</label>
          <select value={settings.messageDeletePolicy || 'sender'}
            onChange={(e) => updateSetting('messageDeletePolicy', e.target.value)}
            className="rounded border px-3 py-1 text-sm">
            <option value="sender">Absender + Admins</option>
            <option value="admins">Nur Admins</option>
            <option value="nobody">Niemand</option>
          </select>
        </div>

        <Button onClick={save} disabled={saving}>{saving ? 'Speichern...' : 'Einstellungen speichern'}</Button>
      </div>
    </div>
  );
}
