import { Command, Ctx, Help, InjectBot, On, Start, Update } from "@grammyjs/nestjs";
import { Injectable } from "@nestjs/common";
import { Bot, Context } from "grammy";
import { AuthService } from "src/auth/auth.service";
import { ChannelsService } from "src/channels/channels.service";
import { UsersService } from "src/users/users.service";

@Update()
@Injectable()
export class TelegramUpdate {
    constructor(
        @InjectBot()private readonly bot: Bot<Context>,
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
        private readonly channelsService: ChannelsService,
    ) {}

    @Start()
    async onStart(@Ctx() ctx: Context) {
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
            await ctx.reply(
                '<b>Добро пожаловать в tg-autoposter!</b>\n\n' +
                `Привет, ${firstName}!\n\n` +
                'Этот бот поможет вам автоматически публиковать посты в ваши Telegram каналы.\n\n' +
                'Используйте /help для просмотра доступных команд.',
                { parse_mode: 'HTML' }
            );
        } else {
            await ctx.reply(
                '<b>С возвращением!</b>\n\n' +
                `Рад снова вас видеть, ${firstName}!\n\n` +
                'Используйте /help для просмотра доступных команд.',
                { parse_mode: 'HTML' }
            );
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

        const profileInfo = 
            '<b>Профиль пользователя</b>\n\n' +
            `<b>Telegram ID:</b> ${user.telegramId}\n` +
            `<b>Имя пользователя:</b> ${user.telegramUsername || 'Не указано'}\n` +
            `<b>Количество каналов:</b> ${user.channels?.length || 0}\n` +
            `<b>Количество постов:</b> ${user.posts?.length || 0}\n\n` +
            'Используйте /channels для просмотра ваших каналов';

        await ctx.reply(profileInfo, { parse_mode: 'HTML' })
    }

    @Help()
    async onHelp(@Ctx() ctx: Context) {
        const helpInfo = 
            '<b>Доступные команды</b>\n\n' +
            '<b>/start</b> - Запустить бота и начать работу\n' +
            '<b>/profile</b> - Просмотреть ваш профиль\n' +
            '<b>/channels</b> - Просмотреть ваши каналы\n' +
            '<b>/add_channel</b> - Добавить канал (используйте в канале)\n' +
            '<b>/delete_channel</b> - Удалить канал (используйте в канале)\n' +
            '<b>/posts</b> - Просмотреть ваши посты\n\n' +
            '<b>Как добавить канал:</b>\n' +
            '1. Добавьте бота в канал как администратора\n' +
            '2. Отправьте команду /add_channel прямо в канале\n' +
            '3. Канал автоматически добавится в ваш аккаунт\n\n' +
            '<b>Как удалить канал:</b>\n' +
            '1. Перейдите в нужный канал\n' +
            '2. Отправьте команду /delete_channel прямо в канале';
        
        await ctx.reply(helpInfo, { parse_mode: 'HTML' })
    }

    @Command('add_channel')
    async onAddChannel(@Ctx() ctx: Context) {
        const channelPost = ctx.update?.channel_post;

        if (!channelPost) {
            await ctx.reply(
                '<b>Для добавления канала в бот нужно:</b>\n\n' +
                '1. Сделать бота админом канала\n' +
                '2. В канале от СВОЕГО ИМЕНИ отправить сообщение /add_channel\n' +
                '3. Выдать боту права на отправку сообщений в канале.',
                { parse_mode: 'HTML' }
            );
            return;
        }

        const telegramUser = channelPost?.from;
        const tgChat = channelPost?.chat;

        if (!telegramUser) {
            await ctx.reply('Ошибка: Невозможно получить данные пользователя.');
            return;
        }

        if (!tgChat) {
            await ctx.reply('Ошибка: Невозможно получить данные канала.');
            return;
        }

        const user = await this.usersService.findByTelegramId(telegramUser.id.toString());

        if (!user) {
            await ctx.reply(
                '<b>Ошибка: Пользователь не найден</b>\n\n' +
                'Сначала используйте команду /start в личном чате с ботом.',
                { parse_mode: 'HTML' }
            );
            return;
        }

        try {
            const addChannelResult = await this.channelsService.addChannel({
                telegramId: tgChat.id.toString(),
                title: tgChat.title,
                username: tgChat?.username ?? '',
                userId: user.id,
            });

            if (!addChannelResult) {
                await ctx.reply(
                    '<b>Ошибка при добавлении канала</b>\n\n' +
                    'Не удалось создать запись о канале.\n' +
                    'Попробуйте еще раз или обратитесь к администратору.',
                    { parse_mode: 'HTML' }
                );
                return;
            }

            await ctx.reply(
                '<b>Канал успешно добавлен!</b>\n\n' +
                `<b>Название:</b> ${addChannelResult.title}\n` +
                `<b>Username:</b> ${addChannelResult.username ? '@' + addChannelResult.username : 'Не указан'}\n` +
                `<b>ID:</b> ${addChannelResult.telegramId}\n\n` +
                'Теперь вы можете создавать посты для этого канала!\n' +
                'Используйте /channels для просмотра всех ваших каналов.',
                { parse_mode: 'HTML' }
            );
        } catch (error) {
            await ctx.reply(
                '<b>Ошибка при добавлении канала</b>\n\n' +
                `Детали: ${error.message}\n\n` +
                'Попробуйте еще раз или обратитесь к администратору.',
                { parse_mode: 'HTML' }
            );
        }
    }

    @Command('channels')
    async onChannels(@Ctx() ctx: Context) {
        const telegramUser = ctx.update.message?.from;

        if (!telegramUser) {
            await ctx.reply('Ошибка: Невозможно получить данные пользователя.');
            return;
        }

        const user = await this.usersService.findByTelegramId(telegramUser.id.toString());

        if (!user) {
            await ctx.reply('Ошибка: Не удалось получить данные пользователя из БД')
            return;
        }

        const channels = await this.channelsService.getUserChannels(user.id);

        if (channels.length) {
            const channelsList = channels.map(channel => 
                `<b>ID:</b> ${channel.id}\n<b>Название:</b> ${channel.title}`
            ).join('\n\n');
            
            await ctx.reply(
                `<b>Ваши каналы:</b>\n\n${channelsList}`,
                { parse_mode: 'HTML' }
            );
        } else {
            await ctx.reply(
                '<b>У вас пока нет каналов</b>\n\n' +
                'Используйте команду /add_channel в нужном канале, чтобы добавить его.',
                { parse_mode: 'HTML' }
            );
        }
    }

    @Command('delete_channel')
    async onDeleteChannel (@Ctx() ctx: Context) {
        const channelPost = ctx.update?.channel_post;

        if (!channelPost) {
            await ctx.reply(
                '<b>Для удаления канала нужно:</b>\n\n' +
                '1. Перейти в канал\n' +
                '2. В канале от СВОЕГО ИМЕНИ отправить сообщение /delete_channel.',
                { parse_mode: 'HTML' }
            );
            return;
        }

        const telegramUser = channelPost?.from;
        const tgChat = channelPost?.chat;

        if (!telegramUser) {
            await ctx.reply('Ошибка: Невозможно получить данные пользователя.');
            return;
        }

        if (!tgChat) {
            await ctx.reply('Ошибка: Невозможно получить данные канала.');
            return;
        }

        const user = await this.usersService.findByTelegramId(telegramUser.id.toString());

        if (!user) {
            await ctx.reply(
                '<b>Ошибка: Пользователь не найден</b>\n\n' +
                'Сначала используйте команду /start в личном чате с ботом.',
                { parse_mode: 'HTML' }
            );
            return;
        }

        await this.channelsService.deleteChannel(tgChat.id.toString(), user.id);

        await ctx.reply('Channel successfully deleted');

    }

}