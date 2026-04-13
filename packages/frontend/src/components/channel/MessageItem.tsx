interface MessageItemProps {
  message: {
    id: string; content: string; isEdited: boolean; isDeleted: boolean; createdAt: string;
    user?: { id: string; displayName: string; avatarUrl: string | null };
  };
}

export function MessageItem({ message }: MessageItemProps) {
  if (message.isDeleted) return <div className="px-5 py-1 text-sm text-gray-400 italic">Diese Nachricht wurde geloescht.</div>;
  const time = new Date(message.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="group flex gap-3 px-5 py-1.5 hover:bg-gray-50">
      <div className="mt-0.5 h-9 w-9 flex-shrink-0 rounded bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">{message.user?.displayName?.[0]?.toUpperCase() || '?'}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-gray-900">{message.user?.displayName || 'Unbekannt'}</span>
          <span className="text-xs text-gray-500">{time}</span>
          {message.isEdited && <span className="text-xs text-gray-400">(bearbeitet)</span>}
        </div>
        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}
