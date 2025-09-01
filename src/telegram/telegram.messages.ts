import { formatDate } from "src/utils/date.utils";

export const TelegramMessages = {
    errors: {
        userNotFound: 'Ошибка: Невозможно получить данные пользователя.',
        channelNotFound: 'Ошибка: Невозможно получить данные канала.',
        userNotFoundInDB: 'Ошибка: Не удалось получить данные пользователя из БД',
        userNotRegistered: '<b>Ошибка: Пользователь не найден</b>\n\nСначала используйте команду /start в личном чате с ботом.',
    },
    
    channel: {
        addInstructions: '<b>Для добавления канала в бот нужно:</b>\n\n1. Сделать бота админом канала\n2. В канале от СВОЕГО ИМЕНИ отправить сообщение /add_channel\n3. Выдать боту права на отправку сообщений в канале.',
        deleteInstructions: '<b>Для удаления канала нужно:</b>\n\n1. Перейти в канал\n2. В канале от СВОЕГО ИМЕНИ отправить сообщение /delete_channel.',
        addSuccess: (title: string, username: string, telegramId: string) => 
            '<b>Канал успешно добавлен!</b>\n\n' +
            `<b>Название:</b> ${title}\n` +
            `<b>Username:</b> ${username ? '@' + username : 'Не указан'}\n` +
            `<b>ID:</b> ${telegramId}\n\n` +
            'Теперь вы можете создавать посты для этого канала!\n' +
            'Используйте /channels для просмотра всех ваших каналов.',
        addError: (errorMessage: string) => 
            '<b>Ошибка при добавлении канала</b>\n\n' +
            'Не удалось создать запись о канале.\n' +
            'Попробуйте еще раз или обратитесь к администратору.',
        addErrorWithDetails: (errorMessage: string) => 
            '<b>Ошибка при добавлении канала</b>\n\n' +
            `Детали: ${errorMessage}\n\n` +
            'Попробуйте еще раз или обратитесь к администратору.',
        deleteSuccess: 'Channel successfully deleted',
        noChannels: '<b>У вас пока нет каналов</b>\n\nИспользуйте команду /add_channel в нужном канале, чтобы добавить его.',
        channelsList: (channelsList: string) => `<b>Ваши каналы:</b>\n\n${channelsList}`,
    },
    
    profile: {
        info: (telegramId: string, username: string, channelsCount: number, postsCount: number) => 
            '<b>Профиль пользователя</b>\n\n' +
            `<b>Telegram ID:</b> ${telegramId}\n` +
            `<b>Имя пользователя:</b> ${username || 'Не указано'}\n` +
            `<b>Количество каналов:</b> ${channelsCount}\n` +
            `<b>Количество постов:</b> ${postsCount}\n\n` +
            'Используйте /channels для просмотра ваших каналов',
    },
    
    post: {
        createStart: '<b>Создание поста</b>\n\nОтправьте текст поста, который хотите опубликовать.',
        selectChannel: '<b>Выберите канал для публикации:</b>',
        noChannelsForPost: '<b>У вас нет каналов для публикации</b>\n\nСначала добавьте канал с помощью команды /add_channel',
        publishSuccess: (channelTitle: string, isScheduled: boolean = false, scheduledAt?: Date) => {
            if (isScheduled && scheduledAt) {
                return `<b>Пост запланирован для публикации в канале:</b> ${channelTitle}\n\n<b>Время публикации:</b> ${formatDate(scheduledAt)}`;
            } else {
                return `<b>Пост успешно опубликован в канале:</b> ${channelTitle}`;
            }
        },
        publishError: (channelTitle: string, error: string) => `<b>Ошибка публикации в канале ${channelTitle}:</b>\n${error}`,
        confirmPublish: (content: string, channelTitle: string, scheduledAt?: Date) => {
            return '<b>Подтвердите публикацию:</b>\n\n' +
                `<b>Текст поста:</b>\n${content}\n\n` +
                `<b>Канал:</b> ${channelTitle}\n\n` +
                (scheduledAt ? `<b>Время публикации:</b> ${formatDate(scheduledAt)}\n\n` : '') +
                'Нажмите "Опубликовать" для отправки поста.';
        },
        contentTooLong: 'Текст поста слишком длинный. Максимум 4096 символов.',
        contentEmpty: 'Текст поста не может быть пустым. Попробуйте еще раз.',
        postCancelled: 'Создание поста отменено.',
        enterSchedule: '<b>Укажите время публикации:</b>\n\n' +
            'Формат: 2025-12-25T15:30:00+03:00 (ISO8601)\n' +
            'в случае некорректной даты пост будет опубликован сразу же',
        invalidDateFormat: 'Неверный формат даты. Используйте формат ISO8601: 2025-12-25T15:30:00+03:00, в случае некорректной даты пост будет опубликован сразу же',
    },
    
    help: {
        commands: 
            '<b>Доступные команды</b>\n\n' +
            '<b>/start</b> - Запустить бота и начать работу\n' +
            '<b>/profile</b> - Просмотреть ваш профиль\n' +
            '<b>/channels</b> - Просмотреть ваши каналы\n' +
            '<b>/add_channel</b> - Добавить канал (используйте в канале)\n' +
            '<b>/delete_channel</b> - Удалить канал (используйте в канале)\n' +
            '<b>/create_post</b> - Создать и опубликовать пост\n' +
            '<b>/posts</b> - Просмотреть ваши посты\n\n',
    },
    
    welcome: {
        newUser: (firstName: string) => 
            '<b>Добро пожаловать в tg-autoposter!</b>\n\n' +
            `Привет, ${firstName}!\n\n` +
            'Этот бот поможет вам автоматически публиковать посты в ваши Telegram каналы.\n\n' +
            'Используйте /help для просмотра доступных команд.',
        returningUser: (firstName: string) => 
            '<b>С возвращением!</b>\n\n' +
            `Рад снова вас видеть, ${firstName}!\n\n` +
            'Используйте /help для просмотра доступных команд.',
    },
};
