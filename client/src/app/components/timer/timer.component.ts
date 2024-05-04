import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import {
    END_TIME_STRING,
    MAX_GAME_CONST,
    MILLISECONDS_IN_ONE_SECOND,
    MILLISECONDS_IN_TENTH_SECOND,
    START_TIME_STRING,
    TENTH_SECOND_IN_SECONDS,
} from '@app/constants';
import { GameService } from '@app/services/game-service/game.service';
import { Subscription } from 'rxjs';
import { TIMER_DECREMENTATION_VALUE } from './timer.constants';

@Component({
    selector: 'app-timer[gameService]',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements AfterViewInit, OnDestroy {
    @Input() gameService!: GameService;

    timeOutput: string = 'XX:XX';
    seconds = 0;
    intervalId?: ReturnType<typeof setInterval>;
    intervalCount = 0;

    private replaySpeedChangedSubscription?: Subscription;
    private bonusSubscription?: Subscription;
    private startStopSubscription?: Subscription;

    ngAfterViewInit() {
        this.setupEventListeners();
    }

    ngOnDestroy(): void {
        this.replaySpeedChangedSubscription?.unsubscribe();
        this.bonusSubscription?.unsubscribe();
        this.startStopSubscription?.unsubscribe();
    }

    addSeconds(value: number) {
        if (this.isClassic()) {
            this.seconds += value;
        } else {
            this.seconds = this.seconds + value > MAX_GAME_CONST ? MAX_GAME_CONST : this.seconds + value;
        }
        if (this.seconds < 0) this.seconds = 0;
        this.timeOutput = new Date(this.seconds * MILLISECONDS_IN_ONE_SECOND).toTimeString().slice(START_TIME_STRING, END_TIME_STRING);
    }

    start() {
        this.seconds = 0;
        this.addSeconds(this.gameService.gameInfo.initialTime);
        this.resume(1);
    }

    resume(speed: number) {
        this.intervalId = setInterval(() => {
            if (this.intervalCount % TENTH_SECOND_IN_SECONDS === 0) {
                this.addSeconds(this.isClassic() ? 1 : TIMER_DECREMENTATION_VALUE);
            }
            this.intervalCount++;
        }, MILLISECONDS_IN_TENTH_SECOND / speed);
    }

    stop() {
        clearInterval(this.intervalId);
        this.intervalId = undefined;
    }

    reset() {
        this.stop();
        this.seconds = 0;
    }

    setupEventListeners() {
        const bonusObserver = {
            next: (bonus: number) => {
                this.addSeconds(bonus);
            },
        };
        this.bonusSubscription = this.gameService.bonusObservable.subscribe(bonusObserver);

        const timerObserver = {
            next: (start: boolean) => {
                if (start) {
                    this.start();
                } else {
                    this.stop();
                }
            },
        };
        this.startStopSubscription = this.gameService.timerObservable.subscribe(timerObserver);

        this.replaySpeedChangedSubscription = this.gameService.replaySpeedChangedObservable.subscribe((newSpeed) => {
            if (!newSpeed) {
                this.stop();
            } else {
                this.resume(newSpeed);
            }
        });
    }

    private isClassic() {
        return false;
    }
}
