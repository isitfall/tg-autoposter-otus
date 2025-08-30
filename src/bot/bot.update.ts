import { Update, Start, Help, Command, On, Ctx, Sender } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { User as TelegramUser } from 'telegraf/typings/core/types/typegram';



@Update()
@Injectable()
export class BotUpdate {
  private readonly logger = new Logger(BotUpdate.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context, @Sender() telegramUser: TelegramUser) {
    try {
      if (!telegramUser) {
        await ctx.reply('❌ Ошибка: Невозможно получить данные пользователя.');
        return;
      }

      const telegramId = telegramUser.id.toString();
      const username = telegramUser.username;
      const firstName = telegramUser.first_name;
      const lastName = telegramUser.last_name;
      const languageCode = telegramUser.language_code;

      // Авторизация через наш сервис
      const authResult = await this.authService.telegramAuth({
        telegramId,
        telegramUsername: username,
        telegramFirstName: firstName,
        telegramLastName: lastName,
        telegramLanguageCode: languageCode,
      });

      if (authResult.isNewUser) {
        await ctx.reply(
          `Добро пожаловать, ${firstName}!\n\n` +
          `Вы успешно зарегистрированы в системе автопостинга!\n\n` +
          `Теперь вы можете:\n` +
          `• Добавлять Telegram каналы\n` +
          `• Создавать посты\n` +
          `• Планировать публикации\n\n` +
          `Используйте /help для просмотра всех команд.`,
          this.getMainKeyboard()
        );
      } else {
        await ctx.reply(
          `С возвращением, ${firstName}!\n\n` +
          `Вы уже авторизованы в системе.\n` +
          `Выберите действие или используйте /help для справки.`,
          this.getMainKeyboard()
        );
      }

      // Обновляем статус активности
      await this.usersService.markAsActive(telegramId);

    } catch (error) {
      this.logger.error('Error in start command:', error);
      await ctx.reply('Произошла ошибка при авторизации. Попробуйте еще раз.');
    }
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    const helpText = 
      `*Telegram Autoposter Bot*\n\n` +
      `*Доступные команды:*\n` +
      `/start - Авторизация и главное меню\n` +
      `/help - Показать эту справку\n` +
      `/profile - Ваш профиль\n` +
      `/channels - Управление каналами\n\n` +
      `*Функции:*\n` +
      `• Добавление Telegram каналов\n` +
      `• Создание и планирование постов\n` +
      `• Автоматическая публикация\n` +
      `• Статистика публикаций\n\n` +
      `*Совет:* Используйте кнопки меню для быстрого доступа к функциям!`;

    await ctx.reply(helpText, {
      parse_mode: 'Markdown',
      ...this.getMainKeyboard()
    });
  }

  @Command('profile')
  async onProfile(@Ctx() ctx: Context, @Sender() telegramUser: TelegramUser) {
    try {
      if (!telegramUser) {
        await ctx.reply('Ошибка: Невозможно получить данные пользователя.');
        return;
      }

      const telegramId = telegramUser.id.toString();
      const user = await this.usersService.findByTelegramId(telegramId);
      
      if (!user) {
        await ctx.reply('Пользователь не найден. Используйте /start для регистрации.');
        return;
      }

      const profileText = 
        `*Ваш профиль*\n\n` +
        `ID: \`${user.id}\`\n` +
        `Имя: ${user.telegramFirstName}${user.telegramLastName ? ' ' + user.telegramLastName : ''}\n` +
        `Username: ${user.telegramUsername ? '@' + user.telegramUsername : 'Не указан'}\n` +
        `Язык: ${user.telegramLanguageCode || 'Не указан'}\n` +
        `Зарегистрирован: ${user.createdAt.toLocaleDateString('ru-RU')}\n` +
        `Статус: ${user.isActive ? 'Активен' : 'Неактивен'}\n\n` +
        `*Статистика:*\n` +
        `Каналов: ${user.channels?.length || 0}\n` +
        `Постов: ${user.posts?.length || 0}`;

      await ctx.reply(profileText, {
        parse_mode: 'Markdown',
        ...this.getMainKeyboard()
      });

    } catch (error) {
      this.logger.error('Error in profile command:', error);
      await ctx.reply('Ошибка при получении профиля. Попробуйте еще раз.');
    }
  }

  @Command('channels')
  async onChannels(@Ctx() ctx: Context, @Sender() telegramUser: TelegramUser) {
    try {
      if (!telegramUser) {
        await ctx.reply('Ошибка: Невозможно получить данные пользователя.');
        return;
      }

      const telegramId = telegramUser.id.toString();
      const user = await this.usersService.findByTelegramId(telegramId);
      
      if (!user) {
        await ctx.reply('Пользователь не найден. Используйте /start для регистрации.');
        return;
      }

      if (!user.channels || user.channels.length === 0) {
        await ctx.reply(
          `*Ваши каналы*\n\n` +
          `У вас пока нет добавленных каналов.\n\n` +
          `Для добавления канала:\n` +
          `1. Добавьте бота в администраторы канала\n` +
          `2. Отправьте команду /add_channel\n` +
          `3. Следуйте инструкциям`,
          { 
            parse_mode: 'Markdown',
            ...this.getChannelsKeyboard()
          }
        );
        return;
      }

      let channelsText = `*Ваши каналы (${user.channels.length}):*\n\n`;
      
      user.channels.forEach((channel, index) => {
        channelsText += 
          `${index + 1}. **${channel.title}**\n` +
          `   @${channel.username || 'без username'}\n` +
          `   ID: \`${channel.telegramId}\`\n` +
          `   Добавлен: ${channel.createdAt.toLocaleDateString('ru-RU')}\n\n`;
      });

      await ctx.reply(channelsText, {
        parse_mode: 'Markdown',
        ...this.getChannelsKeyboard()
      });

    } catch (error) {
      this.logger.error('Error in channels command:', error);
      await ctx.reply('Ошибка при получении списка каналов. Попробуйте еще раз.');
    }
  }

  // Обработка кнопок основного меню
  @On('text')
  async onText(@Ctx() ctx: Context) {
    const text = ctx.text;
    
    switch (text) {
      case '📺 Мои каналы':
        await this.onChannels(ctx, ctx.from as TelegramUser);
        break;
      case '👤 Профиль':
        await this.onProfile(ctx, ctx.from as TelegramUser);
        break;
      case '❓ Помощь':
        await this.onHelp(ctx);
        break;
      case '➕ Добавить канал':
        await ctx.reply('Функция добавления каналов будет доступна в следующих обновлениях!');
        break;
      case '📝 Создать пост':
        await ctx.reply('Функция создания постов будет доступна в следующих обновлениях!');
        break;
      case '📅 Запланированные':
        await ctx.reply('Функция просмотра запланированных постов будет доступна в следующих обновлениях!');
        break;
      case '🏠 Главное меню':
        await ctx.reply(
          'Главное меню',
          this.getMainKeyboard()
        );
        break;
      default:
        await ctx.reply(
          `Не понимаю эту команду. Используйте /help для просмотра доступных команд.`,
          this.getMainKeyboard()
        );
    }
  }

  private getMainKeyboard() {
    return {
      reply_markup: {
        keyboard: [
          [{ text: '📺 Мои каналы' }, { text: '➕ Добавить канал' }],
          [{ text: '📝 Создать пост' }, { text: '📅 Запланированные' }],
          [{ text: '👤 Профиль' }, { text: '❓ Помощь' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    };
  }

  private getChannelsKeyboard() {
    return {
      reply_markup: {
        keyboard: [
          [{ text: '➕ Добавить канал' }],
          [{ text: '🏠 Главное меню' }, { text: '❓ Помощь' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    };
  }
}
