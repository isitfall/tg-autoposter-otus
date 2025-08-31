import { Command, Ctx, Help, InjectBot, On, Start, Update } from "@grammyjs/nestjs";
import { Injectable } from "@nestjs/common";
import { Bot, Context } from "grammy";
import { AuthService } from "src/auth/auth.service";
import { ChannelsService } from "src/channels/channels.service";
import { UsersService } from "src/users/users.service";
import { TelegramHelpers } from "./telegram.helpers";
import { TelegramMessages } from "./telegram.messages";

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
        const telegramUser = TelegramHelpers.validateMessageUser(ctx);

        if (!telegramUser) {
            await ctx.reply(TelegramMessages.errors.userNotFound);
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

        const message = authResult.isNewUser 
            ? TelegramMessages.welcome.newUser(firstName)
            : TelegramMessages.welcome.returningUser(firstName);

        await ctx.reply(message, { parse_mode: 'HTML' });
    }


    @Command('profile') 
    async onProfile(@Ctx() ctx: Context) {
        const telegramUser = TelegramHelpers.validateMessageUser(ctx);

        if (!telegramUser) {
            await ctx.reply(TelegramMessages.errors.userNotFound);
            return;
        }

        const user = await TelegramHelpers.getUserFromTelegramId(this.usersService, telegramUser.id.toString());

        if (!await TelegramHelpers.validateUserAndReply(ctx, user, TelegramMessages.errors.userNotFoundInDB)) {
            return;
        }

        const profileInfo = TelegramMessages.profile.info(
            user.telegramId,
            user.telegramUsername,
            user.channels?.length || 0,
            user.posts?.length || 0
        );

        await ctx.reply(profileInfo, { parse_mode: 'HTML' });
    }

    @Help()
    async onHelp(@Ctx() ctx: Context) {
        const helpInfo = 
            TelegramMessages.help.commands +
            TelegramMessages.help.addChannelInstructions +
            TelegramMessages.help.deleteChannelInstructions;
        
        await ctx.reply(helpInfo, { parse_mode: 'HTML' });
    }

    @Command('add_channel')
    async onAddChannel(@Ctx() ctx: Context) {
        const channelData = await TelegramHelpers.validateChannelPost(ctx);

        if (!channelData) {
            await ctx.reply(TelegramMessages.channel.addInstructions, { parse_mode: 'HTML' });
            return;
        }

        const { telegramUser, tgChat } = channelData;

        if (!telegramUser || !tgChat) {
            await ctx.reply(TelegramMessages.errors.userNotFound);
            return;
        }

        const user = await TelegramHelpers.getUserFromTelegramId(this.usersService, telegramUser.id.toString());

        if (!await TelegramHelpers.validateUserAndReply(ctx, user, TelegramMessages.errors.userNotRegistered)) {
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
                await ctx.reply(TelegramMessages.channel.addError(''), { parse_mode: 'HTML' });
                return;
            }

            const successMessage = TelegramMessages.channel.addSuccess(
                addChannelResult.title,
                addChannelResult.username,
                addChannelResult.telegramId
            );

            await ctx.reply(successMessage, { parse_mode: 'HTML' });
        } catch (error) {
            await ctx.reply(TelegramMessages.channel.addErrorWithDetails(error.message), { parse_mode: 'HTML' });
        }
    }

    @Command('channels')
    async onChannels(@Ctx() ctx: Context) {
        const telegramUser = TelegramHelpers.validateMessageUser(ctx);

        if (!telegramUser) {
            await ctx.reply(TelegramMessages.errors.userNotFound);
            return;
        }

        const user = await TelegramHelpers.getUserFromTelegramId(this.usersService, telegramUser.id.toString());

        if (!await TelegramHelpers.validateUserAndReply(ctx, user, TelegramMessages.errors.userNotFoundInDB)) {
            return;
        }

        const channels = await this.channelsService.getUserChannels(user.id);

        if (channels.length) {
            const channelsList = channels.map(channel => 
                `<b>ID:</b> ${channel.id}\n<b>Название:</b> ${channel.title}`
            ).join('\n\n');
            
            await ctx.reply(
                TelegramMessages.channel.channelsList(channelsList),
                { parse_mode: 'HTML' }
            );
        } else {
            await ctx.reply(TelegramMessages.channel.noChannels, { parse_mode: 'HTML' });
        }
    }

    @Command('delete_channel')
    async onDeleteChannel(@Ctx() ctx: Context) {
        const channelData = await TelegramHelpers.validateChannelPost(ctx);

        if (!channelData) {
            await ctx.reply(TelegramMessages.channel.deleteInstructions, { parse_mode: 'HTML' });
            return;
        }

        const { telegramUser, tgChat } = channelData;

        if (!telegramUser || !tgChat) {
            await ctx.reply(TelegramMessages.errors.userNotFound);
            return;
        }

        const user = await TelegramHelpers.getUserFromTelegramId(this.usersService, telegramUser.id.toString());

        if (!await TelegramHelpers.validateUserAndReply(ctx, user, TelegramMessages.errors.userNotRegistered)) {
            return;
        }

        await this.channelsService.deleteChannel(tgChat.id.toString(), user.id);

        await ctx.reply(TelegramMessages.channel.deleteSuccess);
    }

}