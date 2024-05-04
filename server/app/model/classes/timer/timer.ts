import { MAX_TIMER_VALUE } from '@app/constants/timer.constants';
import { TimerEnd } from '@app/interfaces/timer-end/timer-end.interface';
import { SECOND_IN_MILLISECONDS } from '@app/model/classes/game-sessions/game-session.constants';
import { Subject } from 'rxjs';

export class Timer {
    roomId!: string;
    private timerEndedSubscription = new Subject<TimerEnd>();
    // Observable needs to be declared after the subject
    // eslint-disable-next-line @typescript-eslint/member-ordering
    timerEndedObservable = this.timerEndedSubscription.asObservable();
    private startTime!: number;
    private expectedTimeoutEnd!: number;
    private timeout!: NodeJS.Timeout;

    constructor(roomId: string, initialTime: number) {
        this.roomId = roomId;
        this.startTimer(initialTime * SECOND_IN_MILLISECONDS);
    }

    addBonus(bonus: number) {
        const actualTime = Date.now();
        let timeoutTimeLeft = this.expectedTimeoutEnd - actualTime + bonus;
        if (timeoutTimeLeft > MAX_TIMER_VALUE) timeoutTimeLeft = MAX_TIMER_VALUE;

        this.expectedTimeoutEnd = actualTime + timeoutTimeLeft;
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.stopTimer(true);
        }, Math.max(timeoutTimeLeft, 0));
    }

    stopTimer(timeElapsed: boolean) {
        if (timeElapsed) {
            this.timerEndedSubscription.next({
                roomId: this.roomId,
                isEndgame: true,
                value: Date.now() - this.startTime,
            });
        }
        clearTimeout(this.timeout);
    }

    private startTimer(initialTime: number) {
        this.startTime = Date.now();

        this.expectedTimeoutEnd = this.startTime + initialTime;
        this.timeout = setTimeout(() => {
            this.stopTimer(true);
        }, initialTime);
    }
}
