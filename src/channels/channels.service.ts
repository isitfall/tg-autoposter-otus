import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from 'src/entities/channel.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private channelsRepository: Repository<Channel>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async addChannel(channelData: {
    telegramId: string;
    title: string;
    username: string;
    userId: string;
  }): Promise<Channel | null> {
    const user = await this.userRepository.findOne({
      where: { id: channelData.userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const existingChannel = await this.channelsRepository.findOne({
      where: { telegramId: channelData.telegramId, userId: user.id },
    });

    if (existingChannel)
      throw new ConflictException('Channel already exists for this user');

    const channel = this.channelsRepository.create({
      ...channelData,
      user,
    });

    return this.channelsRepository.save(channel);
  }

  async getUserChannels(userId: string): Promise<Channel[]> {
    return this.channelsRepository.find({
      where: { userId },
      relations: ['user'],
    });
  }

  async deleteChannel(
    telegramChannelId: string,
    userId: string,
  ): Promise<void> {
    const channel = await this.channelsRepository.findOne({
      where: { telegramId: telegramChannelId, userId },
    });

    if (!channel) throw new NotFoundException('Channel not found');

    await this.channelsRepository.remove(channel);
  }
}
