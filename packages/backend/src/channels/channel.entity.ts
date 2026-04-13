import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { ChannelType, PostingPermission } from '@chat/shared';
import { Workspace } from '../workspaces/workspace.entity';
import { ChannelMember } from './channel-member.entity';

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id' })
  workspaceId: string;

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @Column({ length: 80 })
  name: string;

  @Column({ type: 'enum', enum: ChannelType, default: ChannelType.PUBLIC })
  type: ChannelType;

  @Column({ type: 'varchar', length: 250, nullable: true })
  topic: string | null;

  @Column({ type: 'varchar', length: 250, nullable: true })
  description: string | null;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'is_archived', default: false })
  isArchived: boolean;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({
    name: 'posting_permission', type: 'enum', enum: PostingPermission,
    default: PostingPermission.EVERYONE,
  })
  postingPermission: PostingPermission;

  @OneToMany(() => ChannelMember, (m) => m.channel)
  members: ChannelMember[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
