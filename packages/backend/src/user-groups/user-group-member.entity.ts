import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { UserGroup } from './user-group.entity';
import { User } from '../users/user.entity';

@Entity('user_group_members')
@Unique(['groupId', 'userId'])
export class UserGroupMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'group_id' })
  groupId: string;

  @ManyToOne(() => UserGroup, (g) => g.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: UserGroup;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'added_at' })
  addedAt: Date;
}
