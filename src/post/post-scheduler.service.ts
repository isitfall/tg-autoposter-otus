import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Bot, Context } from 'grammy';
import { InjectBot } from '@grammyjs/nestjs';
import { PostPublication, PublicationStatus } from 'src/entities/post-publication.entity';
import { PostService } from 'src/post/post.service';
import { LessThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class PostSchedulerService {
    constructor(
        @InjectRepository(PostPublication)
        private readonly postPublicationRepository: Repository<PostPublication>,
        private readonly postService: PostService,
        @InjectBot() private bot: Bot<Context>
    ) {}

    private async publishScheduledPost(publication: PostPublication) {
        try {
            
            await this.bot.api.sendMessage(publication.channel.telegramId, publication.post.content, { parse_mode: 'HTML' });

            await this.postPublicationRepository.update({id: publication.id}, { status: PublicationStatus.PUBLISHED, scheduledAt: new Date() });
        } catch (error) {
            console.error('Error publishing scheduled post:', error);
            await this.postPublicationRepository.update({id: publication.id}, { status: PublicationStatus.FAILED, failureReason: error.message });
        }
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async processScheduledPosts() {
        try {
            const now = new Date();

            const scheduledPosts = await this.postPublicationRepository.find({
                where: {
                    scheduledAt: LessThanOrEqual(now),
                    status: PublicationStatus.SCHEDULED
                },
                relations: ['post', 'channel']
            });

            if (!scheduledPosts.length) return;

            for (const postPublication of scheduledPosts) {
                try {
                    await this.publishScheduledPost(postPublication);
                }
                catch (error) {
                    console.error('Error publishing scheduled post:', error);
                }
            }
        }
        catch (error) {
            console.error('Error processing scheduled posts:', error);
        }
    }
}
