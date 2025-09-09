import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { TelegramAuthData } from 'src/auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByTelegramId(telegramId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { telegramId },
      relations: ['channels', 'posts'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['channels', 'posts'],
    });
  }

  async createFromTelegram(telegramData: TelegramAuthData): Promise<User> {
    const user = this.usersRepository.create({
      telegramId: telegramData.telegramId,
      telegramUsername: telegramData.telegramUsername,
      telegramFirstName: telegramData.telegramFirstName,
      telegramLastName: telegramData.telegramLastName,
      telegramLanguageCode: telegramData.telegramLanguageCode,
      isActive: true,
      isBlocked: false,
      lastInteraction: new Date(),
    });

    return this.usersRepository.save(user);
  }

  async updateTelegramData(
    telegramId: string,
    telegramData: {
      telegramUsername?: string;
      telegramFirstName?: string;
      telegramLastName?: string;
      telegramLanguageCode?: string;
    },
  ): Promise<User> {
    const user = await this.findByTelegramId(telegramId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    Object.assign(user, {
      ...telegramData,
      lastInteraction: new Date(),
    });

    return this.usersRepository.save(user);
  }

  async markAsBlocked(telegramId: string): Promise<void> {
    await this.usersRepository.update(
      { telegramId },
      { isBlocked: true, isActive: false },
    );
  }

  async markAsActive(telegramId: string): Promise<void> {
    await this.usersRepository.update(
      { telegramId },
      {
        isBlocked: false,
        isActive: true,
        lastInteraction: new Date(),
      },
    );
  }

  async getActiveUsers(): Promise<User[]> {
    return this.usersRepository.find({
      where: { isActive: true, isBlocked: false },
    });
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    blocked: number;
  }> {
    const [total, active, blocked] = await Promise.all([
      this.usersRepository.count(),
      this.usersRepository.count({ where: { isActive: true } }),
      this.usersRepository.count({ where: { isBlocked: true } }),
    ]);

    return { total, active, blocked };
  }
}
