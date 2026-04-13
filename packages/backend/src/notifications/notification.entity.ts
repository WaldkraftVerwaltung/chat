import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Message } from '../messages/message.entity';
import { Channel } from '../channels/channel.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ name: 'message_id', nullable: true })
  messageId: string | null;

  @ManyToOne(() => Message, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @Column({ name: 'channel_id', nullable: true })
  channelId: string | null;

  @ManyToOne(() => Channel, { nullable: true })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @Column({ name: 'actor_id', nullable: true })
  actorId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'actor_id' })
  actor: User;

  @Column({ nullable: true })
  summary: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
