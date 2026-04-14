'use client';
import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';

interface InviteLinkDialogProps {
  channelId: string;
  channelName: string;
  onClose: () => void;
}

export function InviteLinkDialog({ channelId, channelName, onClose }: InviteLinkDialogProps) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteLink = `${appUrl}/channel/${channelId}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      addToast('Link kopiert', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Kopieren fehlgeschlagen', 'error');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Einladungslink — #{channelName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600">
            Teile diesen Link mit Workspace-Mitgliedern, um sie direkt zum Channel zu fuehren.
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-gray-50 outline-none select-all"
              onFocus={(e) => e.target.select()}
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors flex-shrink-0 ${
                copied
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? 'Kopiert ✓' : 'Kopieren'}
            </button>
          </div>

          <p className="text-xs text-gray-400">
            Dieser Link ist nur fuer Mitglieder dieses Workspaces zugaenglich.
          </p>
        </div>

        <div className="flex justify-end px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Schliessen
          </button>
        </div>
      </div>
    </div>
  );
}
