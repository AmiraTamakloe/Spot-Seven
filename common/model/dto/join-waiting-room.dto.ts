export enum WaitingRoomType {
    Solo = 'solo',
    Team = 'team',
}

export interface WaitingRoom {
    waitingRoomId: string;
    username: string;
}

export interface JoinSoloWaitingRoomDto extends WaitingRoom {
    type: WaitingRoomType.Solo;
}

export interface JoinTeamWaitingRoomDto extends WaitingRoom {
    teamNumber: number;
    type: WaitingRoomType.Team;
}

export type JoinWaitingRoomDto = JoinSoloWaitingRoomDto | JoinTeamWaitingRoomDto;
