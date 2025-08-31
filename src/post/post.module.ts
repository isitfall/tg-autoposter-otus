import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/entities/post.entity';
import { PostChannel } from 'src/entities/post-channel.entity';
import { Channel } from 'src/entities/channel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostChannel, Channel]),
  ],
  providers: [PostService],
  exports: [PostService]
})
export class PostModule {}
