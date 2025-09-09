import { Context } from "grammy";
import { TelegramUserData } from "./telegram.types";
import { User } from "grammy/types";
import { UsersService } from "src/users/users.service";
import { User as UserEntity } from "src/entities/user.entity";

export class TelegramHelpers {
  static validateChannelPost(ctx: Context): TelegramUserData | null {
    const channelPost = ctx.update?.channel_post;

    if (!channelPost) {
      return null;
    }

    const telegramUser = channelPost?.from;
    const tgChat = channelPost?.chat;

    if (!telegramUser || !tgChat) {
      return null;
    }

    return { telegramUser, tgChat };
  }

  static validateMessageUser(ctx: Context): User | null {
    const telegramUser = ctx.update.message?.from;

    if (!telegramUser) {
      return null;
    }

    return telegramUser;
  }

  static async getUserFromTelegramId(
    usersService: UsersService,
    telegramId: string,
  ): Promise<UserEntity | null> {
    try {
      return await usersService.findByTelegramId(telegramId);
    } catch {
      return null;
    }
  }

  static async validateUserAndReply(
    ctx: Context,
    user: UserEntity,
    errorMessage: string,
  ): Promise<boolean> {
    if (!user) {
      await ctx.reply(errorMessage, { parse_mode: "HTML" });
      return false;
    }
    return true;
  }
}
