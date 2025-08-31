export interface TelegramUserData {
    telegramUser: any;
    tgChat?: any;
    user?: any;
}

export enum PostCreationStateSteps {
    WaitingContent = 'waiting_for_content',
    WaitingChannel = 'waiting_for_channel'
}

export interface PostCreationState {
    userId: string;
    step: PostCreationStateSteps;
    content: string;
}
