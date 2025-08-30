import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Post } from './post.entity';
import { Channel } from './channel.entity';

export enum PostStatus {
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  FAILED = 'failed',
}

@Entity('post_channels')
export class PostChannel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz' })
  scheduledAt: Date;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.SCHEDULED,
  })
  status: PostStatus;

  @Column({ nullable: true, type: 'text' })
  failureReason: string;

  @ManyToOne(() => Post, (post) => post.postChannels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({ name: 'post_id' })
  postId: string;

  @ManyToOne(() => Channel, (channel) => channel.postChannels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @Column({ name: 'channel_id' })
  channelId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
