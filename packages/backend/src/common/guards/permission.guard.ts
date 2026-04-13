import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@chat/shared';

export const PERMISSION_KEY = 'permission';

export function RequirePermission(permission: string) {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(PERMISSION_KEY, permission, descriptor?.value || target);
    return descriptor || target;
  };
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.get<string>(PERMISSION_KEY, context.getHandler());
    if (!permission) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new ForbiddenException();

    // Owners and primary owners always have all permissions
    if ([UserRole.PRIMARY_OWNER, UserRole.OWNER].includes(user.role)) return true;

    // Admins have most permissions
    if (user.role === UserRole.ADMIN) {
      const adminRestricted = ['delete_workspace'];
      if (adminRestricted.includes(permission)) throw new ForbiddenException('Only owners can perform this action');
      return true;
    }

    // Members: check workspace settings
    const settings = user.workspace?.settings || {};
    const settingMap: Record<string, string> = {
      'create_channel': 'whoCanCreateChannels',
      'archive_channel': 'whoCanArchiveChannels',
      'invite_member': 'whoCanInviteMembers',
      'upload_emoji': 'whoCanUploadEmoji',
      'use_at_channel': 'whoCanUseAtChannel',
    };

    const settingKey = settingMap[permission];
    if (settingKey) {
      const allowed = settings[settingKey] || 'everyone';
      if (allowed === 'everyone') return true;
      if (allowed === 'admins') throw new ForbiddenException('Only admins can perform this action');
      if (allowed === 'owners') throw new ForbiddenException('Only owners can perform this action');
    }

    // Guests have very limited permissions
    if (user.role === UserRole.GUEST) {
      const guestAllowed = ['send_message', 'react', 'upload_file'];
      if (!guestAllowed.includes(permission)) throw new ForbiddenException('Guests cannot perform this action');
    }

    return true;
  }
}
