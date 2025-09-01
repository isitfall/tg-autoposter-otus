import { Context } from "grammy";
import { TelegramUserData } from "./telegram.types";

export class TelegramHelpers {
    static async validateChannelPost(ctx: Context): Promise<TelegramUserData | null> {
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

    static validateMessageUser(ctx: Context): any | null {
        const telegramUser = ctx.update.message?.from;

        if (!telegramUser) {
            return null;
        }

        return telegramUser;
    }

    static async getUserFromTelegramId(usersService: any, telegramId: string): Promise<any | null> {
        try {
            return await usersService.findByTelegramId(telegramId);
        } catch {
            return null;
        }
    }

    static async validateUserAndReply(ctx: Context, user: any, errorMessage: string): Promise<boolean> {
        if (!user) {
            await ctx.reply(errorMessage, { parse_mode: 'HTML' });
            return false;
        }
        return true;
    }
}
