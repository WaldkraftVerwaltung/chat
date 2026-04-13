import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Workspace } from '../workspaces/workspace.entity';
import { User } from '../users/user.entity';
import { UserGroupMember } from './user-group-member.entity';

@Entity('user_groups')
export class UserGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id' })
  workspaceId: string;

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 80, unique: true })
  handle: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => UserGroupMember, (m) => m.group)
  members: UserGroupMember[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
