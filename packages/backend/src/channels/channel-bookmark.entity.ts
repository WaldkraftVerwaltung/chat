import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Channel } from './channel.entity';
import { User } from '../users/user.entity';

@Entity('channel_bookmarks')
export class ChannelBookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'channel_id' })
  channelId: string;

  @ManyToOne(() => Channel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @Column({ length: 200 })
  title: string;

  @Column({ length: 2000 })
  url: string;

  @Column({ name: 'emoji', type: 'varchar', length: 10, nullable: true })
  emoji: string | null;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'position', default: 0 })
  position: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
