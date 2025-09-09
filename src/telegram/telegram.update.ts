import {
  Command,
  Ctx,
  Help,
  InjectBot,
  On,
  Start,
  Update,
} from '@grammyjs/nestjs';
import { Injectable } from '@nestjs/common';
import { Bot, Context, InlineKeyboard } from 'grammy';
import { AuthService } from 'src/auth/auth.service';
import { ChannelsService } from 'src/channels/channels.service';
import { UsersService } from 'src/users/users.service';
import { TelegramHelpers } from './telegram.helpers';
import { TelegramMessages } from './telegram.messages';
import { PostCreationStates } from './telegram.post-creation-state';
import { PostCreationStateSteps } from './telegram.types';
import { PostService } from 'src/post/post.service';
import { APP_CONSTANTS } from 'src/constants/app.constants';

@Update()
@Injectable()
export class TelegramUpdate {
  constructor(
    @InjectBot() private readonly bot: Bot<Context>,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly channelsService: ChannelsService,
    private readonly postService: PostService,
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

    const user = await TelegramHelpers.getUserFromTelegramId(
      this.usersService,
      telegramUser.id.toString(),
    );

    if (
      !user ||
      !(await TelegramHelpers.validateUserAndReply(
        ctx,
        user,
        TelegramMessages.errors.userNotFoundInDB,
      ))
    ) {
      return;
    }

    const profileInfo = TelegramMessages.profile.info(
      user?.telegramId,
      user?.telegramUsername,
      user?.channels?.length || 0,
      user?.posts?.length || 0,
    );

    await ctx.reply(profileInfo, { parse_mode: 'HTML' });
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await ctx.reply(TelegramMessages.help.commands, { parse_mode: 'HTML' });
  }

  @Command('add_channel')
  async onAddChannel(@Ctx() ctx: Context) {
    const channelData = TelegramHelpers.validateChannelPost(ctx);

    if (!channelData) {
      await ctx.reply(TelegramMessages.channel.addInstructions, {
        parse_mode: 'HTML',
      });
      return;
    }

    const { telegramUser, tgChat } = channelData;

    if (!telegramUser || !tgChat) {
      await ctx.reply(TelegramMessages.errors.userNotFound);
      return;
    }

    const user = await TelegramHelpers.getUserFromTelegramId(
      this.usersService,
      telegramUser.id.toString(),
    );

    if (
      !user ||
      !(await TelegramHelpers.validateUserAndReply(
        ctx,
        user,
        TelegramMessages.errors.userNotRegistered,
      ))
    ) {
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
        await ctx.reply(TelegramMessages.channel.addError, {
          parse_mode: 'HTML',
        });
        return;
      }

      const successMessage = TelegramMessages.channel.addSuccess(
        addChannelResult.title,
        addChannelResult.username,
        addChannelResult.telegramId,
      );

      await ctx.reply(successMessage, { parse_mode: 'HTML' });
    } catch (error) {
      await ctx.reply(
        TelegramMessages.channel.addErrorWithDetails((error as Error).message),
        { parse_mode: 'HTML' },
      );
    }
  }

  @Command('channels')
  async onChannels(@Ctx() ctx: Context) {
    const telegramUser = TelegramHelpers.validateMessageUser(ctx);

    if (!telegramUser) {
      await ctx.reply(TelegramMessages.errors.userNotFound);
      return;
    }

    const user = await TelegramHelpers.getUserFromTelegramId(
      this.usersService,
      telegramUser.id.toString(),
    );

    if (
      !user ||
      !(await TelegramHelpers.validateUserAndReply(
        ctx,
        user,
        TelegramMessages.errors.userNotFoundInDB,
      ))
    ) {
      return;
    }

    const channels = await this.channelsService.getUserChannels(user.id);

    if (channels.length) {
      const channelsList = channels
        .map(
          (channel) =>
            `<b>ID:</b> ${channel.id}\n<b>Название:</b> ${channel.title}`,
        )
        .join('\n\n');

      await ctx.reply(TelegramMessages.channel.channelsList(channelsList), {
        parse_mode: 'HTML',
      });
    } else {
      await ctx.reply(TelegramMessages.channel.noChannels, {
        parse_mode: 'HTML',
      });
    }
  }

  @Command('delete_channel')
  async onDeleteChannel(@Ctx() ctx: Context) {
    const channelData = TelegramHelpers.validateChannelPost(ctx);

    if (!channelData) {
      await ctx.reply(TelegramMessages.channel.deleteInstructions, {
        parse_mode: 'HTML',
      });
      return;
    }

    const { telegramUser, tgChat } = channelData;

    if (!telegramUser || !tgChat) {
      await ctx.reply(TelegramMessages.errors.userNotFound);
      return;
    }

    const user = await TelegramHelpers.getUserFromTelegramId(
      this.usersService,
      telegramUser.id.toString(),
    );

    if (
      !user ||
      !(await TelegramHelpers.validateUserAndReply(
        ctx,
        user,
        TelegramMessages.errors.userNotRegistered,
      ))
    ) {
      return;
    }
  }

  @Command('create_post')
  async onCreatePost(@Ctx() ctx: Context) {
    const telegramUser = TelegramHelpers.validateMessageUser(ctx);

    if (!telegramUser) {
      await ctx.reply(TelegramMessages.errors.userNotFound);
      return;
    }

    const user = await TelegramHelpers.getUserFromTelegramId(
      this.usersService,
      telegramUser.id.toString(),
    );

    if (
      !user ||
      !(await TelegramHelpers.validateUserAndReply(
        ctx,
        user,
        TelegramMessages.errors.userNotRegistered,
      ))
    ) {
      return;
    }

    const channels = await this.channelsService.getUserChannels(user.id);

    if (channels.length === 0) {
      await ctx.reply(TelegramMessages.post.noChannelsForPost, {
        parse_mode: 'HTML',
      });
      return;
    }

    PostCreationStates.setState(user.id, {
      userId: user.id,
      step: PostCreationStateSteps.WaitingContent,
      content: '',
    });

    await ctx.reply(TelegramMessages.post.createStart, { parse_mode: 'HTML' });
  }

  @On('message:text')
  async onTextMessage(@Ctx() ctx: Context) {
    const telegramUser = TelegramHelpers.validateMessageUser(ctx);
    if (!telegramUser) return;

    const user = await TelegramHelpers.getUserFromTelegramId(
      this.usersService,
      telegramUser.id.toString(),
    );
    if (!user) return;

    const state = PostCreationStates.getState(user.id);
    if (!state) return;

    if (state.step === PostCreationStateSteps.WaitingContent) {
      const content = ctx.message?.text ?? '';

      if (!content.trim()) {
        await ctx.reply(TelegramMessages.post.contentEmpty);
        return;
      }

      if (content.length > APP_CONSTANTS.TELEGRAM.MAX_MESSAGE_LENGTH) {
        await ctx.reply(TelegramMessages.post.contentTooLong);
        return;
      }

      PostCreationStates.updateState(user.id, {
        step: PostCreationStateSteps.WaitingChannel,
        content: content,
      });

      const channels = await this.channelsService.getUserChannels(user.id);

      const keyboard = new InlineKeyboard();

      channels.forEach((channel, i) => {
        const buttonText = channel.title || `Канал ${i + 1}`;
        keyboard.text(buttonText, `select_channel:${channel.id}`);
      });

      await ctx.reply(TelegramMessages.post.selectChannel, {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      });
    }

    if (state.step === PostCreationStateSteps.WaitingSchedule) {
      const dateInput = ctx.message?.text ?? '';

      const parsedDate = new Date(dateInput);

      const scheduledAt = isNaN(parsedDate.getTime()) ? undefined : parsedDate;

      PostCreationStates.updateState(user.id, {
        step: PostCreationStateSteps.WaitingConfirmation,
        scheduledAt: scheduledAt,
      });

      const confirmKeyboard = new InlineKeyboard()
        .text('Publish', 'confirm_post')
        .text('Cancel', 'cancel_post');

      await ctx.reply(
        TelegramMessages.post.confirmPublish(
          state.content,
          state.channelTitle || '',
          scheduledAt,
        ),
        {
          parse_mode: 'HTML',
          reply_markup: confirmKeyboard,
        },
      );
    }
  }

  @On('callback_query')
  async onCallbackQuery(@Ctx() ctx: Context) {
    const callbackData = ctx.callbackQuery?.data;
    if (!callbackData) return;

    const telegramUser = ctx.callbackQuery?.from;
    if (!telegramUser) return;

    const user = await TelegramHelpers.getUserFromTelegramId(
      this.usersService,
      telegramUser.id.toString(),
    );
    if (!user) return;

    if (callbackData.startsWith('select_channel:')) {
      const [, channelId] = callbackData.split(':');

      const state = PostCreationStates.getState(user.id);

      if (!state || state.step !== PostCreationStateSteps.WaitingChannel)
        return;

      try {
        const channels = await this.channelsService.getUserChannels(user.id);
        const channel = channels.find((channel) => channel.id === channelId);

        if (!channel) {
          throw new Error('Канал не найден');
        }

        PostCreationStates.updateState(user.id, {
          step: PostCreationStateSteps.WaitingSchedule,
          channelId: channelId,
          channelTitle: channel.title,
        });

        await ctx.editMessageText(TelegramMessages.post.enterSchedule, {
          parse_mode: 'HTML',
        });
      } catch (error) {
        await ctx.editMessageText(
          TelegramMessages.post.publishError('канал', (error as Error).message),
          { parse_mode: 'HTML' },
        );
      }
    }

    if (callbackData === 'confirm_post') {
      const state = PostCreationStates.getState(user.id);
      if (!state || state.step !== PostCreationStateSteps.WaitingConfirmation)
        return;

      try {
        const post = await this.postService.createPost({
          content: state.content,
          userId: user.id,
          channelId: state.channelId!,
          scheduledAt: state?.scheduledAt ?? undefined,
        });

        const isScheduled = state.scheduledAt && state.scheduledAt > new Date();

        console.log({ post });

        if (!isScheduled) {
          const channels = await this.channelsService.getUserChannels(user.id);
          const channel = channels.find((c) => c.id === state.channelId);

          await this.bot.api.sendMessage(channel!.telegramId, state.content, {
            parse_mode: 'HTML',
          });
        }

        const message = TelegramMessages.post.publishSuccess(
          state.channelTitle || '',
          !!isScheduled,
          state.scheduledAt || undefined,
        );

        await ctx.editMessageText(message, { parse_mode: 'HTML' });
        PostCreationStates.clearState(user.id);
      } catch (err) {
        await ctx.editMessageText(
          TelegramMessages.post.publishError(
            state.channelTitle || 'канал',
            (err as Error).message,
          ),
          { parse_mode: 'HTML' },
        );
      }
    }

    if (callbackData === 'cancel_post') {
      PostCreationStates.clearState(user.id);
      await ctx.editMessageText(TelegramMessages.post.postCancelled);
    }

    try {
      await ctx.answerCallbackQuery();
    } catch (error) {
      console.error('Error answering callback query:', error);
    }
  }
}
