import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, Unique,
} from 'typeorm';
import { NotificationPreference } from '@chat/shared';
import { Channel } from './channel.entity';
import { User } from '../users/user.entity';

@Entity('channel_members')
@Unique(['channelId', 'userId'])
export class ChannelMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'channel_id' })
  channelId: string;

  @ManyToOne(() => Channel, (c) => c.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'notification_preference', type: 'enum', enum: NotificationPreference,
    default: NotificationPreference.ALL,
  })
  notificationPreference: NotificationPreference;

  @Column({ name: 'last_read_at', type: 'timestamptz', nullable: true })
  lastReadAt: Date | null;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
