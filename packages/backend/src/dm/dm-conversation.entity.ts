import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { DmParticipant } from './dm-participant.entity';

@Entity('dm_conversations')
export class DmConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id' })
  workspaceId: string;

  @Column({ name: 'is_group', default: false })
  isGroup: boolean;

  @OneToMany(() => DmParticipant, (p) => p.conversation)
  participants: DmParticipant[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
