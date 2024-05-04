import { WaitingRoom } from './base-waiting-room.interface';

export interface ClassicGameWaitingRooms {
    gameId: string;
    rooms: WaitingRoom[];
}
