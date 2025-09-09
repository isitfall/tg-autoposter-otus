import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { TelegramAuthData } from "src/auth/auth.service";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByTelegramId(telegramId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { telegramId },
      relations: ["channels", "posts"],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ["channels", "posts"],
    });
  }

  async createFromTelegram(telegramData: TelegramAuthData): Promise<User> {
    const user = this.usersRepository.create({
      telegramId: telegramData.telegramId,
      telegramUsername: telegramData.telegramUsername,
      telegramFirstName: telegramData.telegramFirstName,
      telegramLastName: telegramData.telegramLastName,
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
      throw new NotFoundException("Пользователь не найден");
    }

    Object.assign(user, {
      ...telegramData,
      lastInteraction: new Date(),
    });

    return this.usersRepository.save(user);
  }
}
