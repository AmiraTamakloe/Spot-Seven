import { TimeLimitedWaitingRoom, WaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
import { SessionType } from '@common/model/guess-result';
import { WaitingRoomStatus } from '@common/model/waiting-room-status';
import { defaultGame } from './game';
import { player1, player2, player3, player4 } from './player';
import { GameMode } from '@common/game-mode';

export const defaultEmptyWaitingRoom: WaitingRoom = {
    id: '123',
    creator: player1,
    waitingPlayers: [],
    game: defaultGame,
    sessionType: SessionType.Classic,
    joinState: WaitingRoomStatus.Created,
    friendsUserIdAllowed: [],
    gameMode: GameMode.Classic,
    chatId: '123',
};

export const defaultWaitingRoomWithOnePlayerInQueue: WaitingRoom = {
    id: '123',
    creator: player1,
    waitingPlayers: [player2],
    game: defaultGame,
    sessionType: SessionType.Classic,
    joinState: WaitingRoomStatus.Joined,
    gameMode: GameMode.Classic,
    chatId: '123',
};

export const defaultWaitingRoomWithTwoPlayersInQueue: WaitingRoom = {
    id: '123',
    creator: player1,
    waitingPlayers: [player2, player3],
    game: defaultGame,
    sessionType: SessionType.Classic,
    joinState: WaitingRoomStatus.Joined,
    gameMode: GameMode.Classic,
    chatId: '123',
};

export const defaultWaitingRoomWithThreePlayersInQueue: WaitingRoom = {
    id: '123',
    creator: player1,
    waitingPlayers: [player2, player3, player4],
    game: defaultGame,
    sessionType: SessionType.Classic,
    joinState: WaitingRoomStatus.Joined,
    gameMode: GameMode.Classic,
    chatId: '123',
};

export const defaultTimeLimitedWaitingRoomWithOnePlayerInQueue: TimeLimitedWaitingRoom = {
    id: '123',
    creator: player1,
    waitingPlayers: [player2],
    sessionType: SessionType.TimeLimited,
    joinState: WaitingRoomStatus.Joined,
    gameMode: GameMode.TimeLimited,
    chatId: '123',
};

export const defaultTimeLimitedWaitingRoomWithTwoPlayersInQueue: TimeLimitedWaitingRoom = {
    id: '123',
    creator: player1,
    waitingPlayers: [player2, player3],
    sessionType: SessionType.TimeLimited,
    joinState: WaitingRoomStatus.Joined,
    gameMode: GameMode.TimeLimited,
    chatId: '123',
};

export const defaultEmptyTimeLimitedWaitingRoom: TimeLimitedWaitingRoom = {
    id: '123',
    creator: player1,
    waitingPlayers: [],
    sessionType: SessionType.TimeLimited,
    gameMode: GameMode.TimeLimited,
    joinState: WaitingRoomStatus.Created,
    chatId: '123',
};
