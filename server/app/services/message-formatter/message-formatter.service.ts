import { GameSession } from '@app/model/schema/game-session';
import { Message, MessageAuthor, Position } from '@common/model/message';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageFormatterService {
    createUsedHintMessage(): Message {
        return {
            author: MessageAuthor.System,
            content: 'Indice Utilisé.',
            time: Date.now(),
        };
    }

    createDifferenceFoundMessage(playerName?: string): Message {
        return {
            author: MessageAuthor.System,
            content: playerName ? `Différence trouvée par ${playerName}.` : 'Différence trouvée.',
            time: Date.now(),
        };
    }

    createErrorMessage(playerName?: string): Message {
        return {
            author: MessageAuthor.System,
            content: playerName ? `Erreur par ${playerName}.` : 'Erreur.',
            time: Date.now(),
        };
    }

    createGiveUpMessage(playerName: string): Message {
        return {
            author: MessageAuthor.System,
            content: `${playerName} a abandonné la partie.`,
            time: Date.now(),
        };
    }

    createRecordBeatenMessage(playerName: string, position: Position, gameSession: GameSession): Message {
        const nbPlayers = gameSession.isMultiplayer() ? 'un contre un' : 'solo';
        return {
            author: MessageAuthor.Leaderboard,
            content: `${playerName} obtient la ${position} place dans les meilleurs temps du jeu "${gameSession.game.name}" en ${nbPlayers}!`,
            time: Date.now(),
        };
    }
}
