export interface CreatePostDto {
    content: string;
    userId: string;
    channelIds: string[];
}

export interface PublishPostDto {
    postId: string;
    channelId: string;
}