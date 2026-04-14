'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type FileItem = {
  id: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  user?: { displayName: string };
  message?: { channel?: { name: string } };
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) return <span className="text-2xl">🖼️</span>;
  if (mimeType === 'application/pdf') return <span className="text-2xl">📄</span>;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <span className="text-2xl">📊</span>;
  if (mimeType.includes('word') || mimeType.includes('document')) return <span className="text-2xl">📝</span>;
  if (mimeType.includes('video')) return <span className="text-2xl">🎬</span>;
  if (mimeType.includes('audio')) return <span className="text-2xl">🎵</span>;
  if (mimeType.includes('zip') || mimeType.includes('archive')) return <span className="text-2xl">📦</span>;
  return <span className="text-2xl">📎</span>;
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'image' | 'document' | 'other'>('all');

  useEffect(() => {
    apiFetch<FileItem[]>('/files')
      .then(setFiles)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = files.filter((f) => {
    if (search && !f.originalFilename.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'image' && !f.mimeType.startsWith('image/')) return false;
    if (filter === 'document' && !(
      f.mimeType === 'application/pdf' ||
      f.mimeType.includes('word') ||
      f.mimeType.includes('document') ||
      f.mimeType.includes('spreadsheet') ||
      f.mimeType.includes('excel') ||
      f.mimeType.includes('text/')
    )) return false;
    if (filter === 'other' && (f.mimeType.startsWith('image/') || f.mimeType === 'application/pdf' || f.mimeType.includes('word') || f.mimeType.includes('document') || f.mimeType.includes('spreadsheet') || f.mimeType.includes('excel') || f.mimeType.includes('text/'))) return false;
    return true;
  });

  return (
    <div className="flex flex-1 flex-col bg-white">
      <div className="border-b px-6 py-4">
        <h1 className="text-lg font-bold text-gray-900">Dateien</h1>
        <p className="text-sm text-gray-500 mt-1">Alle geteilten Dateien aus allen Channels und Direktnachrichten</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b px-6 py-3">
        <input
          type="text"
          placeholder="Dateien durchsuchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
        />
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1">
          {(['all', 'image', 'document', 'other'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                filter === f ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f === 'all' ? 'Alle' : f === 'image' ? 'Bilder' : f === 'document' ? 'Dokumente' : 'Andere'}
            </button>
          ))}
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-gray-400">Laden...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-4">📁</span>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Keine Dateien gefunden</h2>
            <p className="text-sm text-gray-500 max-w-sm">
              {search ? 'Deine Suche hat keine Ergebnisse geliefert.' : 'Teile Dateien in einem Channel oder einer Direktnachricht, um sie hier zu sehen.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide w-8"></th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Geteilt von</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Channel</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Größe</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Datum</th>
                <th className="px-3 py-2 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-3">
                    <FileIcon mimeType={file.mimeType} />
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-medium text-gray-900 truncate max-w-xs block">{file.originalFilename}</span>
                    <span className="text-xs text-gray-400">{file.mimeType}</span>
                  </td>
                  <td className="px-3 py-3 text-gray-600">{file.user?.displayName || '—'}</td>
                  <td className="px-3 py-3 text-gray-500">
                    {file.message?.channel?.name ? `#${file.message.channel.name}` : '—'}
                  </td>
                  <td className="px-3 py-3 text-gray-500">{formatBytes(Number(file.sizeBytes))}</td>
                  <td className="px-3 py-3 text-gray-500">
                    {new Date(file.createdAt).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-3 py-3">
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL || ''}/api/files/${file.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden group-hover:inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      ↓ Herunterladen
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
