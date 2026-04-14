import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Message } from './message.entity';

@Entity('message_edits')
export class MessageEdit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'message_id' })
  messageId: string;

  @ManyToOne(() => Message, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'edited_at' })
  editedAt: Date;
}
