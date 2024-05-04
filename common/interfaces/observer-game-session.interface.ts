import { GameMode } from '@common/game-mode';
import { GameInfo } from '@common/model/game-info';
import { GuessResultClassicSuccess, GuessResultTimeLimitedSuccess } from '@common/model/guess-result';
import { Player } from '@common/model/player';

export interface ObserverGameSession {
    gameRoomId: string,
    observersRoomId: string,
    gameName: string,
    gameMode: GameMode,
    currentObservers: Player[];
    currentDifferencesFound: (GuessResultClassicSuccess | GuessResultTimeLimitedSuccess)[];
}

export interface ObserversGameInfo {
    observersGameSession: ObserverGameSession,
    gameInfo: GameInfo
}
