import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { DmConversation } from './dm-conversation.entity';
import { User } from '../users/user.entity';

@Entity('dm_participants')
@Unique(['conversationId', 'userId'])
export class DmParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id' })
  conversationId: string;

  @ManyToOne(() => DmConversation, (c) => c.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: DmConversation;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'last_read_at', type: 'timestamptz', nullable: true })
  lastReadAt: Date | null;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
