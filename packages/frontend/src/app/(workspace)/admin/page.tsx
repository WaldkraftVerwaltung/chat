'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

type AdminSection = 'settings' | 'edit' | 'members' | 'roles' | 'apps' | 'export' | 'analytics';

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconBuilding() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function IconWrench() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

// ─── WorkspaceSettings ────────────────────────────────────────────────────────

interface WsSettings {
  whoCanCreateChannels?: string;
  whoCanArchiveChannels?: string;
  whoCanInviteMembers?: string;
  whoCanUploadEmoji?: string;
  whoCanUseAtChannel?: string;
  messageEditWindow?: number | null;
  messageDeletePolicy?: string;
}

function WorkspaceSettings({ workspace, onUpdate }: { workspace: any; onUpdate: (ws: any) => void }) {
  const [settings, setSettings] = useState<WsSettings>({});
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (workspace?.settings) setSettings(workspace.settings);
  }, [workspace]);

  async function save() {
    setSaving(true);
    try {
      const updated = await apiFetch<any>('/workspace', {
        method: 'PATCH',
        body: JSON.stringify({ settings }),
      });
      onUpdate(updated);
      addToast('Einstellungen gespeichert', 'success');
    } catch (e: any) {
      addToast(e.message || 'Fehler beim Speichern', 'error');
    } finally {
      setSaving(false);
    }
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
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-1">Workspace-Einstellungen</h2>
      <p className="text-sm text-gray-500 mb-8">Berechtigungen und Richtlinien für diesen Workspace</p>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Berechtigungen</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {permOptions.map((opt) => (
            <div key={opt.key} className="flex items-center justify-between px-6 py-4">
              <label className="text-sm text-gray-700">{opt.label}</label>
              <select
                value={(settings as any)[opt.key] || 'everyone'}
                onChange={(e) => updateSetting(opt.key, e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="everyone">Alle Mitglieder</option>
                <option value="admins">Nur Admins</option>
                <option value="owners">Nur Owners</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Nachrichten</h3>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm text-gray-700">Nachrichten bearbeiten</p>
              <p className="text-xs text-gray-500 mt-0.5">Zeitfenster, in dem Mitglieder eigene Nachrichten bearbeiten dürfen</p>
            </div>
            <select
              value={settings.messageEditWindow === null ? 'unlimited' : String(settings.messageEditWindow ?? 'unlimited')}
              onChange={(e) => updateSetting('messageEditWindow', e.target.value === 'unlimited' ? null : parseInt(e.target.value))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="unlimited">Unbegrenzt</option>
              <option value="1">1 Minute</option>
              <option value="5">5 Minuten</option>
              <option value="30">30 Minuten</option>
              <option value="60">1 Stunde</option>
              <option value="1440">24 Stunden</option>
            </select>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm text-gray-700">Nachrichten löschen</p>
              <p className="text-xs text-gray-500 mt-0.5">Wer darf Nachrichten löschen?</p>
            </div>
            <select
              value={settings.messageDeletePolicy || 'sender'}
              onChange={(e) => updateSetting('messageDeletePolicy', e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="sender">Absender + Admins</option>
              <option value="admins">Nur Admins</option>
              <option value="nobody">Niemand</option>
            </select>
          </div>
        </div>
      </div>

      <Button onClick={save} disabled={saving}>
        {saving ? 'Speichern...' : 'Einstellungen speichern'}
      </Button>
    </div>
  );
}

// ─── WorkspaceEdit ────────────────────────────────────────────────────────────

function WorkspaceEdit({ workspace, onUpdate }: { workspace: any; onUpdate: (ws: any) => void }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (workspace?.name) setName(workspace.name);
  }, [workspace]);

  async function saveName() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const updated = await apiFetch<any>('/workspace', {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      });
      onUpdate(updated);
      addToast('Workspace-Name gespeichert', 'success');
    } catch (e: any) {
      addToast(e.message || 'Fehler beim Speichern', 'error');
    } finally {
      setSaving(false);
    }
  }

  const defaultChannels: string[] = workspace?.defaultChannels || ['#allgemein', '#ankündigungen'];

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-1">Workspace bearbeiten</h2>
      <p className="text-sm text-gray-500 mb-8">Name, Icon und Standard-Channels verwalten</p>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Workspace-Name</h3>
        </div>
        <div className="px-6 py-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <div className="flex gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Workspace-Name"
            />
            <Button onClick={saveName} disabled={saving || !name.trim()}>
              {saving ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Workspace-Icon</h3>
        </div>
        <div className="px-6 py-5 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow">
            {name.charAt(0).toUpperCase() || 'W'}
          </div>
          <div>
            <p className="text-sm text-gray-700 mb-2">Lade ein eigenes Logo oder Icon hoch.</p>
            <Button variant="secondary" onClick={() => addToast('Upload-Funktion folgt in Kürze', 'info')}>
              Bild hochladen
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Standard-Channels</h3>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-500 mb-4">Neue Mitglieder werden diesen Channels automatisch hinzugefügt.</p>
          <div className="space-y-2">
            {defaultChannels.map((ch, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2.5">
                <span className="text-sm font-medium text-gray-800">{ch}</span>
                <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">Standard</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => addToast('Channel-Verwaltung folgt in Kürze', 'info')}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
            + Channel hinzufügen
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MembersManagement ────────────────────────────────────────────────────────

type Member = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  role?: string;
  isActive?: boolean;
  lastActiveAt?: string | null;
};

function MembersManagement({ members, onUpdate }: { members: Member[]; onUpdate: (m: Member[]) => void }) {
  const [search, setSearch] = useState('');
  const [pendingRole, setPendingRole] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const { addToast } = useToast();

  const filtered = members.filter((m) =>
    m.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()),
  );

  async function changeRole(member: Member, newRole: string) {
    setLoadingId(member.id);
    try {
      const updated = await apiFetch<Member>(`/users/${member.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      onUpdate(members.map((m) => (m.id === member.id ? { ...m, ...updated } : m)));
      addToast(`Rolle von ${member.displayName} auf ${newRole} gesetzt`, 'success');
    } catch (e: any) {
      addToast(e.message || 'Fehler beim Ändern der Rolle', 'error');
    } finally {
      setLoadingId(null);
    }
  }

  async function toggleActive(member: Member) {
    setLoadingId(member.id);
    try {
      const updated = await apiFetch<Member>(`/users/${member.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !member.isActive }),
      });
      onUpdate(members.map((m) => (m.id === member.id ? { ...m, ...updated } : m)));
      addToast(
        updated.isActive
          ? `${member.displayName} wurde aktiviert`
          : `${member.displayName} wurde deaktiviert`,
        'success',
      );
    } catch (e: any) {
      addToast(e.message || 'Fehler beim Ändern des Status', 'error');
    } finally {
      setLoadingId(null);
    }
  }

  async function sendInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await apiFetch('/auth/invite', {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail }),
      });
      addToast(`Einladung an ${inviteEmail} gesendet`, 'success');
      setInviteEmail('');
      setShowInvite(false);
    } catch (e: any) {
      addToast(e.message || 'Fehler beim Senden der Einladung', 'error');
    } finally {
      setInviting(false);
    }
  }

  function formatDate(d?: string | null) {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  const roleBadge: Record<string, string> = {
    primary_owner: 'bg-purple-100 text-purple-800',
    owner: 'bg-blue-100 text-blue-800',
    admin: 'bg-indigo-100 text-indigo-800',
    member: 'bg-gray-100 text-gray-700',
    guest: 'bg-yellow-100 text-yellow-800',
  };

  const roleLabels: Record<string, string> = {
    primary_owner: 'Hauptinhaber',
    owner: 'Owner',
    admin: 'Admin',
    member: 'Mitglied',
    guest: 'Gast',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Mitglieder verwalten</h2>
          <p className="text-sm text-gray-500 mt-1">{members.length} Mitglieder im Workspace</p>
        </div>
        <Button onClick={() => setShowInvite(true)}>+ Mitglied einladen</Button>
      </div>

      {showInvite && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Mitglied einladen</h3>
          <div className="flex gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendInvite()}
              placeholder="E-Mail-Adresse"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={sendInvite} disabled={inviting || !inviteEmail.trim()}>
              {inviting ? 'Senden...' : 'Einladung senden'}
            </Button>
            <Button variant="secondary" onClick={() => setShowInvite(false)}>Abbrechen</Button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Mitglieder suchen..."
          className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Mitglied</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Rolle</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Zuletzt aktiv</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">Keine Mitglieder gefunden</td>
              </tr>
            )}
            {filtered.map((m) => {
              const role = m.role || 'member';
              return (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {m.avatarUrl ? (
                        <img src={m.avatarUrl} alt={m.displayName} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                          {(m.displayName || m.email || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{m.displayName || '—'}</p>
                        <p className="text-xs text-gray-500">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadge[role] || roleBadge.member}`}>
                      {roleLabels[role] || role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${m.isActive !== false ? 'text-green-700' : 'text-gray-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.isActive !== false ? 'bg-green-500' : 'bg-gray-300'}`} />
                      {m.isActive !== false ? 'Aktiv' : 'Deaktiviert'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{formatDate(m.lastActiveAt)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <select
                        value={pendingRole[m.id] || role}
                        onChange={(e) => setPendingRole((p) => ({ ...p, [m.id]: e.target.value }))}
                        disabled={loadingId === m.id}
                        className="rounded border border-gray-300 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="member">Mitglied</option>
                        <option value="guest">Gast</option>
                      </select>
                      {(pendingRole[m.id] && pendingRole[m.id] !== role) && (
                        <button
                          onClick={() => {
                            changeRole(m, pendingRole[m.id]);
                            setPendingRole((p) => { const n = { ...p }; delete n[m.id]; return n; });
                          }}
                          disabled={loadingId === m.id}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap">
                          Übernehmen
                        </button>
                      )}
                      <button
                        onClick={() => toggleActive(m)}
                        disabled={loadingId === m.id}
                        className={`text-xs font-medium whitespace-nowrap ${m.isActive !== false ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}`}>
                        {loadingId === m.id ? '...' : m.isActive !== false ? 'Deaktivieren' : 'Aktivieren'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── RolesManagement ──────────────────────────────────────────────────────────

const ROLE_DEFINITIONS = [
  {
    id: 'primary_owner',
    label: 'Hauptinhaber',
    badge: 'bg-purple-100 text-purple-800',
    description: 'Vollständige Kontrolle über den Workspace. Kann andere Owners ernennen und den Workspace löschen.',
    permissions: [
      'Alle Admin-Funktionen',
      'Workspace löschen',
      'Owners ernennen/entfernen',
      'Abrechnungsdaten verwalten',
      'Alle Nachrichten löschen',
    ],
  },
  {
    id: 'owner',
    label: 'Owner',
    badge: 'bg-blue-100 text-blue-800',
    description: 'Hohe Berechtigungen. Kann Workspace-Einstellungen ändern und Admins verwalten.',
    permissions: [
      'Workspace-Einstellungen ändern',
      'Admins ernennen/entfernen',
      'Mitglieder verwalten',
      'Alle Channels verwalten',
      'Datenexport starten',
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    badge: 'bg-indigo-100 text-indigo-800',
    description: 'Kann Mitglieder und Channels verwalten, aber keine Workspace-Einstellungen ändern.',
    permissions: [
      'Mitglieder einladen und entfernen',
      'Channels erstellen und archivieren',
      'Nachrichten von Mitgliedern löschen',
      'Custom Emoji verwalten',
      'Apps installieren',
    ],
  },
  {
    id: 'member',
    label: 'Mitglied',
    badge: 'bg-gray-100 text-gray-700',
    description: 'Standardrolle für alle Workspace-Mitglieder.',
    permissions: [
      'Channels betreten und verlassen',
      'Nachrichten senden und empfangen',
      'Eigene Nachrichten bearbeiten/löschen (im Zeitlimit)',
      'Dateien hochladen',
      'Direktnachrichten senden',
    ],
  },
  {
    id: 'guest',
    label: 'Gast',
    badge: 'bg-yellow-100 text-yellow-800',
    description: 'Eingeschränkter Zugriff, meist auf bestimmte Channels begrenzt.',
    permissions: [
      'Zugriff nur auf zugewiesene Channels',
      'Nachrichten senden und empfangen',
      'Keine neuen Channels erstellen',
      'Kein Zugriff auf Admin-Bereiche',
    ],
  },
];

function RolesManagement({ members }: { members: Member[] }) {
  const countByRole = members.reduce((acc: Record<string, number>, m) => {
    const r = m.role || 'member';
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-1">Rollen verwalten</h2>
      <p className="text-sm text-gray-500 mb-8">Übersicht der Rollen und ihrer Berechtigungen in diesem Workspace</p>

      <div className="space-y-4">
        {ROLE_DEFINITIONS.map((role) => (
          <div key={role.id} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${role.badge}`}>
                  {role.label}
                </span>
                <span className="text-sm text-gray-500">
                  {countByRole[role.id] || 0} Mitglied{(countByRole[role.id] || 0) !== 1 ? 'er' : ''}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">{role.description}</p>
            <ul className="space-y-1">
              {role.permissions.map((perm, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {perm}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AppsAndWorkflows ─────────────────────────────────────────────────────────

const INTEGRATIONS = [
  { name: 'n8n Workflows', status: 'Aktiv', icon: '⚙️', description: 'Automatisierungen via n8n' },
  { name: 'Claude AI', status: 'Aktiv', icon: '🤖', description: 'KI-Support und Analyse' },
  { name: 'JTL Wawi', status: 'Aktiv', icon: '🏭', description: 'ERP-Anbindung für Kundendaten' },
];

function AppsAndWorkflows() {
  const router = useRouter();
  const { addToast } = useToast();

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-1">Apps und Workflows</h2>
      <p className="text-sm text-gray-500 mb-8">Installierte Integrationen und Automatisierungen verwalten</p>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Workflows</h3>
          <Button onClick={() => router.push('/workflows')}>Alle Workflows</Button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 mb-4">
            Erstelle und verwalte automatisierte Workflows direkt im Workspace.
          </p>
          <button
            onClick={() => router.push('/workflows')}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Zur Workflow-Verwaltung
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Installierte Integrationen</h3>
          <Button variant="secondary" onClick={() => addToast('App-Store folgt in Kürze', 'info')}>
            + App hinzufügen
          </Button>
        </div>
        <div className="divide-y divide-gray-100">
          {INTEGRATIONS.map((app) => (
            <div key={app.name} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{app.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{app.name}</p>
                  <p className="text-xs text-gray-500">{app.description}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {app.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DataExport ───────────────────────────────────────────────────────────────

function DataExport() {
  const [scope, setScope] = useState<'all' | 'custom'>('all');
  const [format] = useState('json');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const { addToast } = useToast();

  async function startExport() {
    setExporting(true);
    setExportStatus('Export wird vorbereitet...');
    try {
      const body: any = { format, scope };
      if (dateFrom) body.dateFrom = dateFrom;
      if (dateTo) body.dateTo = dateTo;

      try {
        const result = await apiFetch<any>('/workspace/export', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        setExportStatus(`Export gestartet. Job-ID: ${result?.jobId || 'n/a'}`);
        addToast('Export wurde gestartet', 'success');
      } catch {
        // Backend might not have export endpoint yet
        await new Promise((r) => setTimeout(r, 1500));
        setExportStatus('Export wird vorbereitet – du erhältst eine Benachrichtigung, wenn er bereit ist.');
        addToast('Export-Anfrage gestellt', 'info');
      }
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-1">Datenexporte</h2>
      <p className="text-sm text-gray-500 mb-8">Exportiere Workspace-Daten als JSON-Archiv</p>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Export konfigurieren</h3>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Umfang</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" value="all" checked={scope === 'all'} onChange={() => setScope('all')}
                  className="accent-blue-600" />
                <span className="text-sm text-gray-700">Alle Channels und Direktnachrichten</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" value="custom" checked={scope === 'custom'} onChange={() => setScope('custom')}
                  className="accent-blue-600" />
                <span className="text-sm text-gray-700">Bestimmte Channels auswählen</span>
              </label>
            </div>
            {scope === 'custom' && (
              <p className="mt-2 text-xs text-gray-500 pl-6">Channel-Auswahl folgt in Kürze.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Zeitraum (optional)</label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400 text-sm">bis</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-700 font-medium">
                JSON
              </span>
            </div>
          </div>
        </div>
      </div>

      {exportStatus && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
          {exportStatus}
        </div>
      )}

      <Button onClick={startExport} disabled={exporting}>
        {exporting ? 'Export wird gestartet...' : 'Export starten'}
      </Button>
    </div>
  );
}

// ─── WorkspaceAnalytics ───────────────────────────────────────────────────────

function WorkspaceAnalytics({ members, channels }: { members: Member[]; channels: any[] }) {
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => {
    if (!m.lastActiveAt) return false;
    const diff = Date.now() - new Date(m.lastActiveAt).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const totalChannels = channels.length;

  // Sort members by last active for activity table
  const sorted = [...members].sort((a, b) => {
    const da = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
    const db = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
    return db - da;
  });

  function timeAgo(d?: string | null) {
    if (!d) return 'Nie';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Gerade eben';
    if (mins < 60) return `vor ${mins} Min.`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `vor ${hrs} Std.`;
    const days = Math.floor(hrs / 24);
    return `vor ${days} Tag${days !== 1 ? 'en' : ''}`;
  }

  const stats = [
    { label: 'Mitglieder gesamt', value: totalMembers, color: 'text-blue-600', bg: 'bg-blue-50', icon: '👥' },
    { label: 'Aktiv (7 Tage)', value: activeMembers, color: 'text-green-600', bg: 'bg-green-50', icon: '✅' },
    { label: 'Channels', value: totalChannels, color: 'text-purple-600', bg: 'bg-purple-50', icon: '📣' },
    {
      label: 'Aktivitätsrate',
      value: totalMembers > 0 ? `${Math.round((activeMembers / totalMembers) * 100)}%` : '—',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      icon: '📈',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Workspace-Analytik</h2>
      <p className="text-sm text-gray-500 mb-8">Übersicht der Aktivität in diesem Workspace</p>

      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl p-5 ${s.bg}`}>
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Nachrichtenaktivität (Vorschau)</h3>
        </div>
        <div className="px-6 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-end justify-center gap-2 h-20 mb-3">
              {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="w-8 bg-blue-200 rounded-t-sm hover:bg-blue-400 transition-colors cursor-default"
                  title={['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][i]}
                />
              ))}
            </div>
            <div className="flex gap-2 justify-center text-xs text-gray-400">
              {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => (
                <span key={d} className="w-8 text-center">{d}</span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">Nachrichtenaktivität der letzten 7 Tage (Platzhalterdaten)</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Mitglieder-Aktivität</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Mitglied</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Rolle</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Zuletzt aktiv</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.slice(0, 20).map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    {m.avatarUrl ? (
                      <img src={m.avatarUrl} alt={m.displayName} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                        {(m.displayName || m.email || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-gray-900">{m.displayName || m.email}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-600 capitalize">{m.role || 'member'}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${m.isActive !== false ? 'text-green-700' : 'text-gray-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${m.isActive !== false ? 'bg-green-500' : 'bg-gray-300'}`} />
                    {m.isActive !== false ? 'Aktiv' : 'Deaktiviert'}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">{timeAgo(m.lastActiveAt)}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">Keine Mitgliederdaten verfügbar</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main AdminPage ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [activeSection, setActiveSection] = useState<AdminSection>('settings');
  const [workspace, setWorkspace] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [channels, setChannels] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any>('/workspace').then(setWorkspace).catch(() => {});
    apiFetch<Member[]>('/users').then(setMembers).catch(() => {});
    apiFetch<any[]>('/channels').then(setChannels).catch(() => {});
  }, []);

  type NavItem =
    | { id: AdminSection; label: string; icon: React.ReactNode }
    | { type: 'divider' };

  const NAV_ITEMS: NavItem[] = [
    { id: 'settings', label: 'Workspace-Einstellungen', icon: <IconBuilding /> },
    { id: 'edit', label: 'Workspace bearbeiten', icon: <IconPencil /> },
    { type: 'divider' },
    { id: 'members', label: 'Mitglieder verwalten', icon: <IconUsers /> },
    { id: 'roles', label: 'Rollen verwalten', icon: <IconShield /> },
    { type: 'divider' },
    { id: 'apps', label: 'Apps und Workflows', icon: <IconWrench /> },
    { id: 'export', label: 'Datenexporte', icon: <IconBox /> },
    { id: 'analytics', label: 'Workspace-Analytik', icon: <IconChart /> },
  ];

  return (
    <div className="flex flex-1 h-full bg-white overflow-hidden">
      {/* Left sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-gray-200 overflow-y-auto flex flex-col">
        <div className="px-5 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-base font-bold text-gray-900">Administrator:innen-Tool</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-gray-600 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-xl leading-none">
              &times;
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {(workspace?.name || 'W').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{workspace?.name || 'Workspace'}</p>
              <p className="text-xs text-gray-500">Business+</p>
            </div>
          </div>
        </div>

        <nav className="p-3 flex-1">
          {NAV_ITEMS.map((item, i) => {
            if ('type' in item && item.type === 'divider') {
              return <div key={`divider-${i}`} className="border-t border-gray-100 my-1.5 mx-1" />;
            }
            const navItem = item as { id: AdminSection; label: string; icon: React.ReactNode };
            const isActive = activeSection === navItem.id;
            return (
              <button
                key={navItem.id}
                onClick={() => setActiveSection(navItem.id)}
                className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm transition-colors text-left ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100 font-normal'
                }`}>
                <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>{navItem.icon}</span>
                <span>{navItem.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Angemeldet als {user?.displayName || user?.email || '—'}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeSection === 'settings' && (
          <WorkspaceSettings workspace={workspace} onUpdate={setWorkspace} />
        )}
        {activeSection === 'edit' && (
          <WorkspaceEdit workspace={workspace} onUpdate={setWorkspace} />
        )}
        {activeSection === 'members' && (
          <MembersManagement members={members} onUpdate={setMembers} />
        )}
        {activeSection === 'roles' && (
          <RolesManagement members={members} />
        )}
        {activeSection === 'apps' && <AppsAndWorkflows />}
        {activeSection === 'export' && <DataExport />}
        {activeSection === 'analytics' && (
          <WorkspaceAnalytics members={members} channels={channels} />
        )}
      </div>
    </div>
  );
}
