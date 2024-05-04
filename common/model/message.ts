export enum MessageAuthor {
    User,
    Opponent,
    System,
    Leaderboard,
}

export enum Position {
    First = 'première',
    Second = 'deuxième',
    Third = 'troisième',
}

export interface Message {
    content: string;
    author: MessageAuthor;
    time: number;
}

// TODO: Keep either Message or ChatMessage
export interface ChatMessage {
    content: string;
    author: string;
    time: string;
    destination: string;
}
