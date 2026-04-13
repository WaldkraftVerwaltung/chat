import { UserRole, GuestType } from '../enums/role.enum';
import { Presence } from '../enums/presence.enum';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  fullName: string | null;
  title: string | null;
  phone: string | null;
  timezone: string;
  avatarUrl: string | null;
  statusText: string | null;
  statusEmoji: string | null;
  statusExpiration: Date | null;
  presence: Presence;
  role: UserRole;
  guestType: GuestType | null;
  isActive: boolean;
  lastActiveAt: Date | null;
  createdAt: Date;
}

export interface UpdateProfileDto {
  displayName?: string;
  fullName?: string;
  title?: string;
  phone?: string;
  timezone?: string;
}

export interface UpdateStatusDto {
  statusText: string | null;
  statusEmoji: string | null;
  statusExpiration: Date | null;
}
