export interface TelegramUserData {
    telegramUser: any;
    tgChat?: any;
    user?: any;
}

export enum PostCreationStateSteps {
    WaitingContent = 'waiting_for_content',
    WaitingChannel = 'waiting_for_channel',
    WaitingSchedule = 'waiting_for_schedule',
    WaitingConfirmation = 'waiting_for_confirmation'
}

export interface PostCreationState {
    userId: string;
    step: PostCreationStateSteps;
    content: string;
    channelId?: string;
    channelTitle?: string;
    scheduledAt?: Date | null;
}
