import { ExistingGame } from './game';

export enum ResultType {
    Success,
    Failure,
}

export enum SessionType {
    Classic,
    TimeLimited,
}

export interface GuessResultClassicSuccess {
    sessionType: SessionType.Classic;
    type: ResultType.Success;
    difference: string;
    successfulPlayerName?: string;
}

export interface GuessResultClassicFailure {
    sessionType: SessionType.Classic;
    type: ResultType.Failure;
}

export interface GuessResultTimeLimitedSuccess {
    sessionType: SessionType.TimeLimited;
    type: ResultType.Success;
    game?: ExistingGame;
    successfulPlayerName?: string;

}

export interface GuessResultTimeLimitedFailure {
    sessionType: SessionType.TimeLimited;
    type: ResultType.Failure;
}

export type GuessResultTimeLimited = GuessResultTimeLimitedSuccess | GuessResultTimeLimitedFailure;
export type GuessResultClassic = GuessResultClassicSuccess | GuessResultClassicFailure;
export type GuessResult = GuessResultClassic | GuessResultTimeLimited;
