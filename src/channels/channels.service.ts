import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './channel.entity';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private channelsRepository: Repository<Channel>,
  ) {}

  async create(channelData: Partial<Channel>): Promise<Channel> {
    const channel = this.channelsRepository.create(channelData);
    return await this.channelsRepository.save(channel);
  }

  async findAll(userId: number): Promise<Channel[]> {
    return await this.channelsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Channel | null> {
    return await this.channelsRepository.findOne({
      where: { id, userId },
    });
  }

  async findByUsername(username: string): Promise<Channel | null> {
    return await this.channelsRepository.findOne({
      where: { username },
    });
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.channelsRepository.delete({ id, userId });
  }
}