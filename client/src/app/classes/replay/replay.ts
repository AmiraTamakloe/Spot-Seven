/* eslint-disable @typescript-eslint/no-empty-function */
import { GameReplayCommand } from '@app/interfaces/game-replay-command';
import { Subject } from 'rxjs';
import { ONE_HUNDRED } from './constants';

export class Replay {
    private _percentage: number = 0;

    private initialHistory: GameReplayCommand[];
    private history: GameReplayCommand[];
    private timeout?: ReturnType<typeof setTimeout>;
    private timeoutReplayBar?: ReturnType<typeof setTimeout>;
    private finishedSubject: Subject<void> = new Subject<void>();
    private lastEntryTime: number = 0;
    private speedChangedSubject: Subject<number>;
    private _speed = 1;
    private lenghtReplay: number = 0;
    private progressionSpeed: number = 0;

    private _remainingTime: number = 0;
    private _startTimeEvent: number = 0;
    private _remainingTimeReplayBar: number = 0;
    private _startTimeReplayBar: number = 0;
    private _dropCursor: boolean = false;
    private _manualRestart: boolean = false;
    constructor(history: GameReplayCommand[], replaySpeedChangedSubject: Subject<number>) {
        this.initialHistory = [...history];
        this.history = [...history];
        this.speedChangedSubject = replaySpeedChangedSubject;
        this.lenghtReplay = history[history.length - 1].time - history[0].time;
        this.progressionSpeed = this.lenghtReplay / ONE_HUNDRED;
        this.changeProgress();
        this.scheduleNextEntry();
    }

    get finishedObservable() {
        return this.finishedSubject.asObservable();
    }

    get percentage() {
        return this._percentage;
    }

    get speed() {
        return this._speed;
    }

    set manualMoving(touching: boolean) {
        this._dropCursor = touching;
    }

    set manualRestart(restart: boolean) {
        this._manualRestart = restart;
        this.moveCursor(this._percentage);
    }

    set speed(speed: number) {
        this._speed = speed;
        this.pause();
        this.resume();
    }

    set percentage(value: number) {
        this._percentage = value;
        if (this._dropCursor) {
            this.moveCursor(value);
        }
    }

    moveCursor(newPercentage: number) {
        // stop the replay
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
        if (this.timeoutReplayBar) {
            clearTimeout(this.timeoutReplayBar);
            this.timeoutReplayBar = undefined;
        }
        if (this._manualRestart) {
            this.lastEntryTime = 0;
            this.history = [...this.initialHistory];

            // find event that is closest to the new time
            // calculate remaining time
            const eventValues = this.timeSearch(newPercentage);
            this.passPreviousEvents(eventValues.eventNumber);
            // restart the replay
            this._remainingTime = eventValues.remainingTime;
            this._remainingTimeReplayBar = 0;
            this._dropCursor = false;
            this.resume();
            this._manualRestart = false;
            this._dropCursor = false;
        }
    }

    passPreviousEvents(eventNumber: number) {
        for (let i = 0; i <= eventNumber; i++) {
            const entry = this.history.shift();
            if (!entry) {
                this.finishedSubject.next();
                return;
            }
            entry.action();
        }
    }

    timeSearch(newPercentage: number) {
        const timePassed = this.lenghtReplay * (newPercentage / ONE_HUNDRED);
        const timePassAjusted = timePassed + this.initialHistory[0].time;
        let left = 0;
        let right = this.initialHistory.length - 1;
        while (right - left > 1) {
            const mid = Math.floor((left + right) / 2);
            if (this.initialHistory[mid].time <= timePassAjusted) {
                left = mid;
            } else {
                right = mid;
            }
        }
        const eventNumber = left;
        const remainingTime = this.initialHistory[right].time - timePassAjusted;
        return { eventNumber, remainingTime };
    }

    getTimeoutRemainingTime(duration: number, startTime: number) {
        return duration - (Date.now() - startTime);
    }

    pause() {
        if (this.timeout) {
            this._remainingTime = this.getTimeoutRemainingTime(this.history[0].time - this.lastEntryTime, this._startTimeEvent);
            clearTimeout(this.timeout);
            this.lastEntryTime = 0;
            this.timeout = undefined;
            this.speedChangedSubject.next(0);
        }
        if (this.timeoutReplayBar) {
            this._remainingTimeReplayBar = this.getTimeoutRemainingTime(this.progressionSpeed, this._startTimeReplayBar);
            clearTimeout(this.timeoutReplayBar);
            this.timeoutReplayBar = undefined;
        }
    }

    resume() {
        if (!this.timeoutReplayBar) {
            setTimeout(() => {
                this.changeProgress();
            }, this._remainingTimeReplayBar / this._speed);
        }

        if (!this.timeout) {
            this.timeout = setTimeout(() => {});
            setTimeout(() => {
                this.scheduleNextEntry();
                this.speedChangedSubject.next(this._speed);
            }, this._remainingTime / this._speed);
        }
    }

    isPaused() {
        return this.timeout === undefined;
    }

    restart() {
        this.pause();
        this.percentage = 0;
        this.lastEntryTime = 0;
        this.history = [...this.initialHistory];
        this.scheduleNextEntry();
    }

    end() {
        this.history = [];
        this.finishedSubject.next();
    }

    moveProgress(newPercentage: number) {
        this.percentage = newPercentage;
    }

    private changeProgress() {
        this._startTimeReplayBar = Date.now();
        if (this.percentage >= ONE_HUNDRED) {
            this.end();
            return;
        }
        this.timeoutReplayBar = setTimeout(() => {
            this.percentage = 1 + this.percentage;
            this.changeProgress();
        }, this.progressionSpeed / this._speed);
    }

    private scheduleNextEntry() {
        this._startTimeEvent = Date.now();
        const entry = this.history.at(0);
        if (!entry) {
            this.finishedSubject.next();
            return;
        }

        if (this.lastEntryTime === 0) {
            this.lastEntryTime = entry.time;
        }

        const timeToWait = (entry.time - this.lastEntryTime) / this._speed;

        this.timeout = setTimeout(() => {
            this.history.shift();
            entry.action();
            this.lastEntryTime = entry.time;
            this.scheduleNextEntry();
        }, timeToWait);
    }
}
