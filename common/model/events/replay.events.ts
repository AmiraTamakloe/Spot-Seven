import { EndGameResultDto } from "../dto/end-game-result";
import { GameInfo } from "../game-info";
import { Guess } from "../guess";
import { GuessResult } from "../guess-result";
import { Hint } from "../hints";
import { ChatMessage } from "../message";
import { GameSessionEvent } from "./game-session.events";

export type ReplayEvent = GameSessionEvent.GameStart | GameSessionEvent.GuessDifference | GameSessionEvent.UseHint | GameSessionEvent.Message | GameSessionEvent.EndGame;
export type ReplayEventBody = Guess | ChatMessage | null;
export type ReplayEventResponse = GameInfo | GuessResult | Hint | EndGameResultDto | null;

export interface ReplayEventDto {
    userId: string;
    time: number;
    event: ReplayEvent;
    body: ReplayEventBody;
    response: ReplayEventResponse;
}
