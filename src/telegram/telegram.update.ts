import { Command, Ctx, Help, InjectBot, On, Start, Update } from "@grammyjs/nestjs";
import { Injectable } from "@nestjs/common";
import { Bot, Context } from "grammy";
import { AuthService } from "src/auth/auth.service";
import { UsersService } from "src/users/users.service";

@Update()
@Injectable()
export class TelegramUpdate {
    constructor(
        @InjectBot()private readonly bot: Bot<Context>,
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
    ) {}

    @Start()
    async onStart(@Ctx() ctx: Context) {
        console.log('bot ctx', ctx.update)

        const telegramUser = ctx.update.message?.from;

        if (!telegramUser) {
            await ctx.reply('Ошибка: Невозможно получить данные пользователя.');
            return;
        }

        const telegramId = telegramUser.id.toString();
        const username = telegramUser.username;
        const firstName = telegramUser.first_name;
        const lastName = telegramUser.last_name;
        const languageCode = telegramUser.language_code;

        const authResult = await this.authService.telegramAuth({
            telegramId,
            telegramUsername: username,
            telegramFirstName: firstName,
            telegramLastName: lastName,
            telegramLanguageCode: languageCode,
        });

        if (authResult.isNewUser) {
            await ctx.reply('Добро пожаловать, ' + firstName + '!');
        } else {
            await ctx.reply('С возвращением, ' + firstName + '!');
        }
    }


    @Command('profile') 
    async onProfile(@Ctx() ctx: Context) {
        const telegramUser = ctx.update.message?.from;

        if (!telegramUser) {
            await ctx.reply('Ошибка: Невозможно получить данные пользователя.');
            return;
        }

        const tgId = telegramUser.id;
        const user = await this.usersService.findByTelegramId(tgId.toString());

        if (!user) {
            await ctx.reply('Ошибка: Не удалось получить данные пользователя из БД')
            return;
        }

        const profileInfo = `*Profile* \n telegram_id: ${user.telegramId} \n name: ${user.telegramUsername} \n channels: ${user.channels?.length || 0} \n posts: ${user.posts?.length || 0}`

        await ctx.reply(profileInfo)
    }

    @Help()
    async onHelp(@Ctx() ctx: Context) {
        const helpInfo = `*Help* \n /start - Start the bot \n /profile - View your profile \n /channels - View your channels \n /posts - View your posts`
        await ctx.reply(helpInfo)
    }

}