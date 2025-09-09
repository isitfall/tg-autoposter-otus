import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Channel } from './channel.entity';
import { Post } from './post.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  telegramId: string;

  @Column({ nullable: true })
  telegramUsername: string;

  @Column()
  telegramFirstName: string;

  @Column({ nullable: true })
  telegramLastName: string;

  @OneToMany(() => Channel, (channel) => channel.user, { cascade: true })
  channels: Channel[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
