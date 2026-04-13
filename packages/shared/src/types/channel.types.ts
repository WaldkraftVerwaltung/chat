import { ChannelType, PostingPermission, NotificationPreference } from '../enums/channel-type.enum';

export interface ChannelInfo {
  id: string;
  name: string;
  type: ChannelType;
  topic: string | null;
  description: string | null;
  createdBy: string;
  isArchived: boolean;
  isDefault: boolean;
  postingPermission: PostingPermission;
  memberCount: number;
  createdAt: Date;
}

export interface CreateChannelDto {
  name: string;
  type: ChannelType;
  description?: string;
  topic?: string;
}

export interface UpdateChannelDto {
  topic?: string;
  description?: string;
  postingPermission?: PostingPermission;
}

export interface ChannelMemberInfo {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  notificationPreference: NotificationPreference;
  joinedAt: Date;
}
