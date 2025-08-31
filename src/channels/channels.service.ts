import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

    async addChannel (
        channelData: {
            telegramId: string;
            title: string;
            username: string;
            userId: string;
        }
    ): Promise<Channel | null> {
        const existingChannel = await this.channelsRepository.findOne({
            where: { username: channelData.username }
        })
        if (existingChannel) throw new ConflictException('Channel already exists');


        const user = await this.userRepository.findOne({
            where: { id: channelData.userId }
        })

        if (!user) throw new NotFoundException('User not found');

        const channel = this.channelsRepository.create({
            ...channelData,
            user,
        })

        return this.channelsRepository.save(channel);
    }

    async getUserChannels(userId: string): Promise<Channel[]> {
        return this.channelsRepository.find({
            where: {userId},
            relations: ['user']
        })
    }

    async deleteChannel(id: string): Promise<void> {
        const channel = await this.channelsRepository.findOne({
            where: {id},
            relations: ['user'],
        })

        if (!channel) throw new NotFoundException('Channel not found');

        await this.channelsRepository.remove(channel)
    }
}
