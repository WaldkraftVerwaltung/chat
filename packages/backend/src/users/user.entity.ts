import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { UserRole, GuestType, Presence } from '@chat/shared';
import { Workspace } from '../workspaces/workspace.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id' })
  workspaceId: string;

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'display_name', length: 80 })
  displayName: string;

  @Column({ name: 'full_name', length: 200, nullable: true })
  fullName: string | null;

  @Column({ length: 200, nullable: true })
  title: string | null;

  @Column({ length: 50, nullable: true })
  phone: string | null;

  @Column({ length: 100, default: 'Europe/Berlin' })
  timezone: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'status_text', length: 100, nullable: true })
  statusText: string | null;

  @Column({ name: 'status_emoji', length: 50, nullable: true })
  statusEmoji: string | null;

  @Column({ name: 'status_expiration', type: 'timestamptz', nullable: true })
  statusExpiration: Date | null;

  @Column({ type: 'enum', enum: Presence, default: Presence.AWAY })
  presence: Presence;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.MEMBER })
  role: UserRole;

  @Column({ name: 'guest_type', type: 'enum', enum: GuestType, nullable: true })
  guestType: GuestType | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_active_at', type: 'timestamptz', nullable: true })
  lastActiveAt: Date | null;

  @Column({ name: 'two_factor_enabled', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'two_factor_secret', nullable: true })
  twoFactorSecret: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
