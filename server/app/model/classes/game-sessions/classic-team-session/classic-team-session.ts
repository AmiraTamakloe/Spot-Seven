import { ClassicTeamWaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
import { DifferencesService } from '@app/services/differences/differences.service';
import { GameConstants } from '@common/game-constants';
import { WsException } from '@nestjs/websockets';
import { ClassicSession } from '@app/model/classes/game-sessions/classic-session/classic-session';

export class ClassicTeamSession extends ClassicSession {
    teams: Map<string, number>;

    constructor(differencesService: DifferencesService, waitingRoom: ClassicTeamWaitingRoom, gameConstants: GameConstants) {
        super(differencesService, waitingRoom, gameConstants);
        this.teams = new Map<string, number>();
        let teamCounter = 0;
        waitingRoom.teams.forEach((team) => {
            team.forEach((player) => {
                this.teams.set(player.username, teamCounter);
            });
            teamCounter++;
        });
    }

    getWinner(playerId: string): string | null {
        const player = this.players.get(playerId);
        if (!player) {
            throw new WsException('Player not in room');
        }

        const pointsArrays = new Array<number>(this.teams.size).fill(0);
        for (const playerOfTeam of this.players.values()) {
            const teamNumber = this.teams.get(playerOfTeam.username);
            if (teamNumber === undefined) {
                throw new WsException('Player not in team');
            }
            pointsArrays[teamNumber] += playerOfTeam.differencesFound;
        }

        for (const points of pointsArrays) {
            if (points >= Math.ceil(this.game.differencesCount / 2)) {
                return playerId;
            }
        }
        return null;
    }
}
