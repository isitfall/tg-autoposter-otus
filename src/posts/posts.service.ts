import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Post } from './post.entity';
import { PostChannel, PostStatus } from './post-channel.entity';
import { ChannelsService } from '../channels/channels.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(PostChannel)
    private postChannelsRepository: Repository<PostChannel>,
    private channelsService: ChannelsService,
  ) {}

  async create(postData: any, userId: number): Promise<Post> {
    const { content, mediaUrl, channels } = postData;

    // Создаем пост
    const post = this.postsRepository.create({
      content,
      mediaUrl,
      userId,
    });
    const savedPost = await this.postsRepository.save(post);

    // Создаем записи расписания для каждого канала
    if (channels && channels.length > 0) {
      const postChannels = channels.map(ch => 
        this.postChannelsRepository.create({
          postId: savedPost.id,
          channelId: ch.channelId,
          scheduledAt: new Date(ch.scheduledAt),
        })
      );
      await this.postChannelsRepository.save(postChannels);
    }

    const fullPost = await this.findOne(savedPost.id, userId);
    if (!fullPost) {
      throw new Error('Failed to retrieve created post');
    }
    return fullPost;
  }

  async findAll(userId: number): Promise<Post[]> {
    return await this.postsRepository.find({
      where: { userId },
      relations: ['postChannels', 'postChannels.channel'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Post | null> {
    return await this.postsRepository.findOne({
      where: { id, userId },
      relations: ['postChannels', 'postChannels.channel'],
    });
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.postsRepository.delete({ id, userId });
  }

  async findScheduledPosts(): Promise<PostChannel[]> {
    return await this.postChannelsRepository.find({
      where: {
        status: PostStatus.SCHEDULED,
        scheduledAt: LessThanOrEqual(new Date()),
      },
      relations: ['post', 'channel'],
    });
  }

  async updatePostChannelStatus(id: number, status: PostStatus, failureReason?: string): Promise<void> {
    await this.postChannelsRepository.update(id, { status, failureReason });
  }
}