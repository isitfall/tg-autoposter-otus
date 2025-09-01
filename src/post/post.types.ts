export interface CreatePostDto {
    content: string;
    userId: string;
    channelId: string;
    scheduledAt?: Date;
}

export interface PublishPostDto {
    postId: string;
    channelId: string;
}