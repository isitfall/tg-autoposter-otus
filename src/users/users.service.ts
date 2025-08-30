import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

type CreateOrUpdateUser = Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>;

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async findByTelegramId(tgId: number): Promise<UserEntity | null> {
        return this.userRepository.findOne({ where: { telegramId: tgId } });
    }

    async create(user: CreateOrUpdateUser): Promise<UserEntity> {
        return this.userRepository.save(user);
    }

    async update(id: string, user: CreateOrUpdateUser): Promise<UserEntity | null> {
        await this.userRepository.update(id, user);
        return this.userRepository.findOne({ where: { id } });
    }
}
