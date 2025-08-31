import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from 'src/entities/channel.entity';
import { PostChannel, PostStatus } from 'src/entities/post-channel.entity';
import { Post } from 'src/entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto, PublishPostDto } from './post.types';



@Injectable()
export class PostService {
    constructor(
        @InjectRepository(Post)
        private postsRepostory: Repository<Post>,
        @InjectRepository(PostChannel)
        private postChannelRepository: Repository<PostChannel>,
        @InjectRepository(Channel) 
        private channelRepository: Repository<Channel>, 
    ) {}

    async createPost ({content, userId, channelIds}: CreatePostDto) {
        const post = this.postsRepostory.create({content, userId});

        const saved = await this.postsRepostory.save(post);

        const postChannels = channelIds.map(channelId => {
            this.postChannelRepository.create({
                postId: saved.id,
                channelId,
                status: PostStatus.SCHEDULED,
                scheduledAt: new Date(),
            })
        })

        await this.postChannelRepository.save(postChannels);

        return saved;
    }

    async publishPost({postId, channelId}: PublishPostDto) {
        const postChannel = await this.postChannelRepository.findOne({
            where: {postId, channelId},
            relations: ['post', 'channel'],
        })

        if (!postChannel) {
            throw new Error('PostChannel not found')
        }

        try {
            await this.postChannelRepository.update({
                id: postChannel.id,
            }, {
                status: PostStatus.PUBLISHED,
                scheduledAt: new Date(),
            })

            return true;
        } catch (err) {
            await this.postChannelRepository.update({
                id: postChannel.id,
            }, {
                status: PostStatus.FAILED,
                failureReason: err.message,
            })
        }
    }

    async getUsersPosts(userId: string): Promise<Post[]> {
        return this.postsRepostory.find({
            where: { userId },
            relations: ['postChannels', 'postChannels.channel'],
            order: { createdAt: 'DESC' }
        })
    }

    async getPostById(postId: string): Promise<Post | null> {
        return this.postsRepostory.findOne({
            where: {id: postId},
            relations: ['postChannels', 'postChannels.channel', 'user'],
        })
    }

    async deletePost(postId: string, userId: string): Promise<void> {
        const post = await this.postsRepostory.findOne({
          where: { id: postId, userId },
        });
    
        if (!post) {
          throw new Error('Post not found or access denied');
        }
    
        await this.postsRepostory.remove(post);
      }
}
