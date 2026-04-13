import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Message } from '../messages/message.entity';

@Entity('saved_items')
export class SavedItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'message_id' })
  messageId: string;

  @ManyToOne(() => Message, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @Column({ default: 'in_progress' })
  status: 'in_progress' | 'completed' | 'archived';

  @Column({ name: 'remind_at', type: 'timestamptz', nullable: true })
  remindAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
