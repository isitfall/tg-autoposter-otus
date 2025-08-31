import { PostCreationState } from "./teelgram.types";

export class PostCreationStates {
    private static states = new Map<string, PostCreationState>();

    static setState(userId: string, state: PostCreationState): void {
        this.states.set(userId, state);
    }

    static getState(userId: string): PostCreationState | undefined {
        return this.states.get(userId);
    }

    static clearState(userId: string): void {
        this.states.delete(userId);
    }

    static updateState(userId: string, updates: Partial<PostCreationState>): void {
        const currentState = this.states.get(userId);
        if (currentState) {
            this.states.set(userId, { ...currentState, ...updates });
        }
    }
}