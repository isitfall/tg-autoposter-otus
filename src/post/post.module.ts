import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/entities/post.entity';
import { PostPublication } from 'src/entities/post-publication.entity';
import { Channel } from 'src/entities/channel.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { PostSchedulerService } from './post-scheduler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostPublication, Channel]),
    ScheduleModule.forRoot()
  ],
  providers: [PostService, PostSchedulerService],
  exports: [PostService, PostSchedulerService]
})
export class PostModule {}
