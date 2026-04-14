'use client';
import { useState, useRef, useEffect } from 'react';
import { ReactionBar } from './ReactionBar';
import { FilePreview } from './FilePreview';
import { EmojiPicker } from './EmojiPicker';
import { MessageContextMenu } from './MessageContextMenu';
import { UserProfileCard } from './UserProfileCard';
import { useThreadsStore } from '@/stores/threads.store';
import { useAuthStore } from '@/stores/auth.store';
import { useMessagesStore } from '@/stores/messages.store';
import { Avatar } from '@/components/ui/Avatar';
import { getSocket } from '@/lib/socket';
import { apiFetch } from '@/lib/api';
import { renderMrkdwn } from '@/lib/mrkdwn';
import { ForwardMessageDialog } from './ForwardMessageDialog';
import { MessageEditHistoryModal } from './MessageEditHistoryModal';

interface MessageFile {
  id: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  thumbnailKey: string | null;
}

interface MessageUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

interface MessageData {
  id: string;
  content: string;
  isEdited: boolean;
  isDeleted: boolean;
  isPinned?: boolean;
  createdAt: string;
  userId?: string;
  user?: MessageUser;
  reactions?: Reaction[];
  replyCount?: number;
  files?: MessageFile[];
  threadParticipants?: MessageUser[];
}

interface MessageItemProps {
  message: MessageData;
  channelId: string;
  isGrouped?: boolean;
}

export function MessageItem({ message, channelId, isGrouped = false }: MessageItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [profileCardPos, setProfileCardPos] = useState({ top: 0, left: 0 });
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [showEditHistory, setShowEditHistory] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout>();
  const messageRef = useRef<HTMLDivElement>(null);
  const currentUser = useAuthStore((s) => s.user);

  function handleUserHoverStart(e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    hoverTimerRef.current = setTimeout(() => {
      setProfileCardPos({ top: rect.bottom + 4, left: rect.left });
      setShowProfileCard(true);
    }, 400);
  }

  function handleUserHoverEnd() {
    clearTimeout(hoverTimerRef.current);
  }
  const isOwn = currentUser?.id === (message.userId || message.user?.id);

  // Listen for arrow-up edit-message event
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail.messageId === message.id) {
        setIsEditing(true);
        setEditContent(message.content);
      }
    };
    window.addEventListener('edit-message', handler as EventListener);
    return () => window.removeEventListener('edit-message', handler as EventListener);
  }, [message.id, message.content]);

  // Deleted message
  if (message.isDeleted) {
    return (
      <div className="px-5 py-1.5 flex gap-3">
        <div className="w-9 flex-shrink-0" />
        <p className="text-sm text-slack-gray-text italic">Diese Nachricht wurde geloescht.</p>
      </div>
    );
  }

  const time = new Date(message.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }

  function handleReaction(emoji: string) {
    getSocket().emit('reaction:toggle', { messageId: message.id, emojiCode: emoji, channelId });
    setShowEmojiPicker(false);
  }

  function handleOpenThread() {
    useThreadsStore.getState().openThread(message.id);
  }

  async function handlePin() {
    try {
      await apiFetch(`/messages/${message.id}/pin`, { method: 'POST' });
      useMessagesStore.getState().updateMessage(message.id, { isPinned: !message.isPinned });
    } catch (err) {
      console.error('Pin failed:', err);
    }
  }

  function handleEdit() {
    const text = editContent.trim();
    if (!text || text === message.content) {
      setIsEditing(false);
      return;
    }
    try {
      getSocket().emit('message:edit', { messageId: message.id, content: text, channelId });
      useMessagesStore.getState().updateMessage(message.id, { content: text, isEdited: true });
      setIsEditing(false);
    } catch (err) {
      console.error('Edit failed:', err);
    }
  }

  function handleDelete() {
    if (!window.confirm('Nachricht endgueltig loeschen?')) return;
    try {
      getSocket().emit('message:delete', { messageId: message.id, channelId });
      useMessagesStore.getState().removeMessage(channelId, message.id);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  function handleCopyText() {
    navigator.clipboard.writeText(message.content).catch(() => {});
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/chat/${channelId}?msg=${message.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
  }

  function handleMarkUnread() {
    getSocket().emit('message:markUnread', { messageId: message.id, channelId });
  }

  function handleForward() {
    setShowForwardDialog(true);
  }

  async function handleSave() {
    try {
      await apiFetch('/saved-items', { method: 'POST', body: JSON.stringify({ messageId: message.id }) });
    } catch {}
  }

  function handleRemind(minutes: number) {
    getSocket().emit('message:remind', { messageId: message.id, minutes });
  }

  // The rendered mrkdwn HTML is generated from user-authored message content that
  // has been escaped via escapeHtml() inside renderMrkdwn before any transformations.
  const renderedHtml = renderMrkdwn(message.content);

  return (
    <>
      <div
        ref={messageRef}
        className={`group relative flex gap-3 px-5 hover:bg-slack-msg-hover transition-colors ${
          isGrouped ? 'py-0.5' : 'py-1.5'
        } ${message.isPinned ? 'bg-yellow-50/50 border-l-2 border-yellow-400' : ''}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => { setShowActions(false); setShowMoreMenu(false); }}
        onContextMenu={handleContextMenu}
      >
        {/* Avatar or time gutter */}
        {isGrouped ? (
          <div className="w-9 flex-shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-slack-gray-text">{time}</span>
          </div>
        ) : (
          <button className="mt-0.5 flex-shrink-0 cursor-pointer"
            onMouseEnter={handleUserHoverStart} onMouseLeave={handleUserHoverEnd}
            onClick={(e) => { clearTimeout(hoverTimerRef.current); const rect = e.currentTarget.getBoundingClientRect(); setProfileCardPos({ top: rect.bottom + 4, left: rect.left }); setShowProfileCard(true); }}>
            <Avatar name={message.user?.displayName || '?'} avatarUrl={message.user?.avatarUrl} size="md" />
          </button>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          {!isGrouped && (
            <div className="flex items-baseline gap-2">
              <button className="text-sm font-bold text-gray-900 hover:underline cursor-pointer"
                onMouseEnter={handleUserHoverStart} onMouseLeave={handleUserHoverEnd}
                onClick={(e) => { clearTimeout(hoverTimerRef.current); const rect = e.currentTarget.getBoundingClientRect(); setProfileCardPos({ top: rect.bottom + 4, left: rect.left }); setShowProfileCard(true); }}>
                {message.user?.displayName || 'Unbekannt'}
              </button>
              <span className="text-xs text-slack-gray-text">{time}</span>
              {message.isEdited && (
                <button
                  onClick={() => setShowEditHistory(true)}
                  className="text-xs text-slack-gray-text hover:underline"
                  title="Bearbeitungs-Verlauf anzeigen"
                >
                  (bearbeitet)
                </button>
              )}
              {message.isPinned && <span className="text-xs text-yellow-600">Angepinnt</span>}
            </div>
          )}

          {/* Edit mode or rendered content */}
          {isEditing ? (
            <div className="mt-1">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEdit(); }
                  if (e.key === 'Escape') { setIsEditing(false); setEditContent(message.content); }
                }}
                className="w-full rounded-md border border-slack-input-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slack-blue/30 resize-none"
                rows={Math.max(2, editContent.split('\n').length)}
                autoFocus
              />
              <div className="mt-1 flex items-center gap-2">
                <button
                  onClick={handleEdit}
                  className="rounded bg-slack-green px-3 py-1 text-xs text-white hover:bg-slack-green-hover"
                >
                  Speichern
                </button>
                <button
                  onClick={() => { setIsEditing(false); setEditContent(message.content); }}
                  className="rounded px-3 py-1 text-xs text-gray-600 hover:bg-gray-100"
                >
                  Abbrechen
                </button>
                <span className="text-xs text-slack-gray-text">Escape zum Abbrechen, Enter zum Speichern</span>
              </div>
            </div>
          ) : (
            <>
              {isGrouped && message.isEdited && (
                <button
                  onClick={() => setShowEditHistory(true)}
                  className="text-xs text-slack-gray-text hover:underline"
                  title="Bearbeitungs-Verlauf anzeigen"
                >
                  (bearbeitet)
                </button>
              )}
              <div
                className="text-sm text-gray-800 whitespace-pre-wrap break-words [&_pre]:whitespace-pre-wrap [&_a]:text-slack-blue [&_a]:hover:underline"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            </>
          )}

          {/* File previews */}
          {message.files && message.files.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {message.files.map((file) => <FilePreview key={file.id} file={file} />)}
            </div>
          )}

          {/* Reactions */}
          <ReactionBar
            messageId={message.id}
            channelId={channelId}
            reactions={message.reactions || []}
          />

          {/* Thread reply count */}
          {message.replyCount != null && message.replyCount > 0 && (
            <button
              onClick={handleOpenThread}
              className="mt-1.5 flex items-center gap-2 rounded-md px-2 py-1 text-xs text-slack-blue hover:bg-slack-mention-bg transition-colors group/thread"
            >
              {message.threadParticipants && message.threadParticipants.length > 0 && (
                <div className="flex -space-x-1.5">
                  {message.threadParticipants.slice(0, 3).map((p, i) => (
                    <Avatar key={p.id || i} name={p.displayName} avatarUrl={p.avatarUrl} size="sm" />
                  ))}
                </div>
              )}
              <span className="font-medium group-hover/thread:underline">
                {message.replyCount} Antwort{message.replyCount !== 1 ? 'en' : ''}
              </span>
              <span className="text-slack-gray-text">Zum Ansehen klicken</span>
            </button>
          )}
        </div>

        {/* Floating action bar */}
        {showActions && !isEditing && (
          <div className="absolute right-4 -top-3 flex items-center rounded-lg border border-slack-border bg-white shadow-md z-10">
            <ActionButton icon="&#128512;" title="Reaktion hinzufuegen" onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
            <ActionButton icon="&#128172;" title="Im Thread antworten" onClick={handleOpenThread} />
            <ActionButton icon="&#128204;" title={message.isPinned ? 'Losloesung aufheben' : 'Anpinnen'} onClick={handlePin} />
            <ActionButton icon="&#128278;" title="Speichern" onClick={handleSave} />
            {isOwn && (
              <ActionButton icon="&#9998;" title="Bearbeiten" onClick={() => { setIsEditing(true); setEditContent(message.content); }} />
            )}
            {isOwn && (
              <ActionButton icon="&#128465;" title="Loeschen" onClick={handleDelete} />
            )}
            <div className="relative">
              <ActionButton icon="&#8943;" title="Mehr" onClick={() => setShowMoreMenu(!showMoreMenu)} />
              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-1 min-w-[180px] rounded-lg border border-slack-border bg-white py-1 shadow-xl z-20">
                  <MoreMenuItem label="Link kopieren" onClick={() => { handleCopyLink(); setShowMoreMenu(false); }} />
                  <MoreMenuItem label="Text kopieren" onClick={() => { handleCopyText(); setShowMoreMenu(false); }} />
                  <MoreMenuItem label="Ab hier als ungelesen" onClick={() => { handleMarkUnread(); setShowMoreMenu(false); }} />
                  <MoreMenuItem label="Weiterleiten" onClick={() => { handleForward(); setShowMoreMenu(false); }} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emoji picker from action bar */}
        {showEmojiPicker && (
          <div className="absolute right-4 top-8 z-50">
            <EmojiPicker
              onSelect={handleReaction}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isOwn={isOwn}
          isPinned={!!message.isPinned}
          onClose={() => setContextMenu(null)}
          onReplyInThread={handleOpenThread}
          onCopyLink={handleCopyLink}
          onCopyText={handleCopyText}
          onPin={handlePin}
          onMarkUnread={handleMarkUnread}
          onEdit={() => { setIsEditing(true); setEditContent(message.content); }}
          onDelete={handleDelete}
          onForward={handleForward}
          onRemind={handleRemind}
          onSave={handleSave}
        />
      )}

      {/* User profile card on hover/click */}
      {showProfileCard && message.user && (
        <UserProfileCard
          user={{
            id: message.user.id,
            displayName: message.user.displayName,
            avatarUrl: message.user.avatarUrl,
            role: (message.user as any).role,
            title: (message.user as any).title,
            statusEmoji: (message.user as any).statusEmoji,
            statusText: (message.user as any).statusText,
            email: (message.user as any).email,
          }}
          position={profileCardPos}
          onClose={() => setShowProfileCard(false)}
        />
      )}

      {/* Forward message dialog */}
      {showForwardDialog && (
        <ForwardMessageDialog
          messageContent={message.content}
          senderName={message.user?.displayName ?? 'Unbekannt'}
          onClose={() => setShowForwardDialog(false)}
        />
      )}

      {/* Edit history modal */}
      {showEditHistory && (
        <MessageEditHistoryModal
          messageId={message.id}
          onClose={() => setShowEditHistory(false)}
        />
      )}
    </>
  );
}

function ActionButton({ icon, title, onClick }: { icon: string; title: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1.5 text-sm text-slack-gray-text hover:bg-slack-msg-hover hover:text-gray-900 first:rounded-l-lg last:rounded-r-lg transition-colors"
      title={title}
    >
      <span dangerouslySetInnerHTML={{ __html: icon }} />
    </button>
  );
}

function MoreMenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-slack-msg-hover text-left"
    >
      {label}
    </button>
  );
}
