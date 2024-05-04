/* eslint-disable @typescript-eslint/no-magic-numbers */
import { GuessResultClassic, GuessResultTimeLimitedSuccess, ResultType, SessionType } from '@common/model/guess-result';

export const DEFAULT_SOLO_GUESS_SUCCESS_RESULT: GuessResultClassic = {
    sessionType: SessionType.Classic,
    type: ResultType.Success,
    difference: 'AQAFAAIAAwA=',
};

export const DEFAULT_SOLO_GUESS_FAILURE_RESULT: GuessResultClassic = {
    sessionType: SessionType.Classic,
    type: ResultType.Failure,
};

export const DEFAULT_COOP_GUESS_SUCCESS_RESULT: GuessResultTimeLimitedSuccess = {
    sessionType: SessionType.TimeLimited,
    type: ResultType.Success,
};
