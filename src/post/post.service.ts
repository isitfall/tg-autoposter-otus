import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from 'src/entities/channel.entity';
import { PostPublication, PublicationStatus } from 'src/entities/post-publication.entity';
import { Post } from 'src/entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto, PublishPostDto } from './post.types';



@Injectable()
export class PostService {
    constructor(
        @InjectRepository(Post)
        private postsRepostory: Repository<Post>,
        @InjectRepository(PostPublication)
        private postPublicationRepository: Repository<PostPublication>,
        @InjectRepository(Channel) 
        private channelRepository: Repository<Channel>, 
    ) {}

    async createPost({content, userId, channelId, scheduledAt}: CreatePostDto) {
        const post = this.postsRepostory.create({content, userId});
        const saved = await this.postsRepostory.save(post);

        const postPublication = this.postPublicationRepository.create({
            postId: saved.id,
            channelId,
            status: PublicationStatus.SCHEDULED,
            scheduledAt: scheduledAt ?? new Date(),
        });

        await this.postPublicationRepository.save(postPublication);
        return saved;
    }

    async publishPost({postId, channelId}: PublishPostDto) {
        const postPublication = await this.postPublicationRepository.findOne({
            where: {postId, channelId},
            relations: ['post', 'channel'],
        })

        if (!postPublication) {
            throw new Error('PostPublication not found')
        }

        try {
            await this.postPublicationRepository.update({
                id: postPublication.id,
            }, {
                status: PublicationStatus.PUBLISHED,
                scheduledAt: new Date(),
            })

            return true;
        } catch (err) {
            await this.postPublicationRepository.update({
                id: postPublication.id,
            }, {
                status: PublicationStatus.FAILED,
                failureReason: err.message,
            })
        }
    }

    async getUsersPosts(userId: string): Promise<Post[]> {
        return this.postsRepostory.find({
            where: { userId },
            relations: ['postPublications', 'postPublications.channel'],
            order: { createdAt: 'DESC' }
        })
    }

    async getPostById(postId: string): Promise<Post | null> {
        return this.postsRepostory.findOne({
            where: {id: postId},
            relations: ['postPublications', 'postPublications.channel', 'user'],
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
