import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/entities/post.entity';
import { PostPublication } from 'src/entities/post-publication.entity';
import { Channel } from 'src/entities/channel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostPublication, Channel]),
  ],
  providers: [PostService],
  exports: [PostService]
})
export class PostModule {}
