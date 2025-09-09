import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../entities/user.entity';

export interface TelegramAuthData {
  telegramId: string;
  telegramUsername?: string;
  telegramFirstName: string;
  telegramLastName?: string;
  telegramLanguageCode?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async telegramAuth(telegramData: TelegramAuthData): Promise<{
    access_token: string;
    user: User;
    isNewUser: boolean;
  }> {
    let user = await this.usersService.findByTelegramId(
      telegramData.telegramId,
    );
    let isNewUser = false;

    if (!user) {
      user = await this.usersService.createFromTelegram(telegramData);
      isNewUser = true;
    } else {
      user = await this.usersService.updateTelegramData(
        telegramData.telegramId,
        telegramData,
      );
    }

    const payload = {
      sub: user.id,
      telegramId: user.telegramId,
      username: user.telegramUsername,
      firstName: user.telegramFirstName,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
      isNewUser,
    };
  }
}
