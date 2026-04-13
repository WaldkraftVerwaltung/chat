export interface MessageInfo {
  id: string;
  channelId: string | null;
  dmConversationId: string | null;
  threadParentId: string | null;
  userId: string;
  content: string;
  isEdited: boolean;
  editedAt: Date | null;
  isDeleted: boolean;
  isPinned: boolean;
  alsoSentToChannel: boolean;
  isSystemMessage: boolean;
  systemMessageType: string | null;
  createdAt: Date;
  user?: { id: string; displayName: string; avatarUrl: string | null };
  replyCount?: number;
  latestReplyAt?: Date | null;
}

export interface CreateMessageDto {
  content: string;
  threadParentId?: string;
  alsoSentToChannel?: boolean;
}

export interface UpdateMessageDto {
  content: string;
}
