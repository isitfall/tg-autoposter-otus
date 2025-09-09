import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { User } from "../entities/user.entity";

export interface TelegramAuthData {
  telegramId: string;
  telegramUsername?: string;
  telegramFirstName: string;
  telegramLastName?: string;
  telegramLanguageCode?: string;
}

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async telegramAuth(telegramData: TelegramAuthData): Promise<{
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

    return {
      user,
      isNewUser,
    };
  }
}
