'use client';
import { useState } from 'react';
import { ReactionBar } from './ReactionBar';
import { FilePreview } from './FilePreview';
import { useThreadsStore } from '@/stores/threads.store';
import { Avatar } from '@/components/ui/Avatar';

interface MessageItemProps {
  message: {
    id: string; content: string; isEdited: boolean; isDeleted: boolean; createdAt: string;
    user?: { id: string; displayName: string; avatarUrl: string | null };
    reactions?: { emoji: string; count: number; userIds: string[] }[];
    replyCount?: number;
    files?: { id: string; originalFilename: string; mimeType: string; sizeBytes: number; thumbnailKey: string | null }[];
  };
  channelId: string;
}

export function MessageItem({ message, channelId }: MessageItemProps) {
  const [showActions, setShowActions] = useState(false);

  if (message.isDeleted) return <div className="px-5 py-1 text-sm text-gray-400 italic">Diese Nachricht wurde geloescht.</div>;
  const time = new Date(message.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="group relative flex gap-3 px-5 py-1.5 hover:bg-gray-50"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="mt-0.5 flex-shrink-0">
        <Avatar name={message.user?.displayName || '?'} avatarUrl={message.user?.avatarUrl} size="md" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-gray-900">{message.user?.displayName || 'Unbekannt'}</span>
          <span className="text-xs text-gray-500">{time}</span>
          {message.isEdited && <span className="text-xs text-gray-400">(bearbeitet)</span>}
        </div>
        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{message.content}</p>
        {message.files && message.files.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {message.files.map((file) => <FilePreview key={file.id} file={file} />)}
          </div>
        )}
        <ReactionBar
          messageId={message.id}
          channelId={channelId}
          reactions={message.reactions || []}
        />
        {message.replyCount != null && message.replyCount > 0 && (
          <button
            onClick={() => useThreadsStore.getState().openThread(message.id)}
            className="mt-1 text-xs text-indigo-600 hover:underline"
          >
            {message.replyCount} Antwort{message.replyCount !== 1 ? 'en' : ''}
          </button>
        )}
      </div>

      {showActions && (
        <div className="absolute right-4 top-1 flex items-center gap-1 rounded-lg border bg-white px-1 py-0.5 shadow-sm">
          <button
            onClick={() => {
              useThreadsStore.getState().openThread(message.id);
            }}
            className="rounded p-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            title="Thread oeffnen"
          >
            💬
          </button>
          <button
            onClick={() => {
              const bar = document.getElementById(`reaction-picker-${message.id}`);
              if (bar) bar.click();
            }}
            className="rounded p-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            title="Reaktion hinzufuegen"
          >
            😊
          </button>
        </div>
      )}
    </div>
  );
}
