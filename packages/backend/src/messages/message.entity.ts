import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Channel } from '../channels/channel.entity';
import { FileAttachment } from '../files/file-attachment.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'channel_id', nullable: true })
  channelId: string | null;

  @ManyToOne(() => Channel, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @Column({ name: 'dm_conversation_id', nullable: true })
  dmConversationId: string | null;

  @Column({ name: 'thread_parent_id', nullable: true })
  threadParentId: string | null;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'thread_parent_id' })
  threadParent: Message;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_edited', default: false })
  isEdited: boolean;

  @Column({ name: 'edited_at', type: 'timestamptz', nullable: true })
  editedAt: Date | null;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @Column({ name: 'is_pinned', default: false })
  isPinned: boolean;

  @Column({ name: 'also_sent_to_channel', default: false })
  alsoSentToChannel: boolean;

  @Column({ name: 'is_system_message', default: false })
  isSystemMessage: boolean;

  @Column({ name: 'system_message_type', nullable: true })
  systemMessageType: string | null;

  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })
  scheduledAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => FileAttachment, (f) => f.message)
  files: FileAttachment[];
}
