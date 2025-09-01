import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/entities/post.entity';
import { PostPublication } from 'src/entities/post-publication.entity';
import { Channel } from 'src/entities/channel.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { PostSchedulerService } from './post-scheduler.service';
import { NestjsGrammyModule } from '@grammyjs/nestjs';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostPublication, Channel]),
    ScheduleModule.forRoot(),
    NestjsGrammyModule
  ],
  providers: [PostService, PostSchedulerService],
  exports: [PostService, PostSchedulerService]
})
export class PostModule {}
