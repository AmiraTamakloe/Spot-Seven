/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameService } from '@app/services/game-service/game.service';
import { GameMode } from '@common/game-mode';
import { Subject } from 'rxjs';
import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    const timerSubject: Subject<boolean> = new Subject();
    const bonusSubject: Subject<number> = new Subject();
    const replaySpeedChangedSubject: Subject<number> = new Subject();
    const timerObservable = timerSubject.asObservable();
    const bonusObservable = bonusSubject.asObservable();
    const replaySpeedChangedObservable = replaySpeedChangedSubject.asObservable();

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['']);
        gameServiceSpy['gameInfo'] = {} as any;
        gameServiceSpy['replaySpeedChangedObservable'] = new Subject<number>().asObservable();

        await TestBed.configureTestingModule({
            declarations: [TimerComponent],
            providers: [{ provide: GameService, useValue: gameServiceSpy }],
        }).compileComponents();

        gameServiceSpy.timerObservable = timerObservable;
        gameServiceSpy.bonusObservable = bonusObservable;
        gameServiceSpy.gameInfo.initialTime = 0;
        gameServiceSpy.gameInfo.gameMode = GameMode.Classic;
        gameServiceSpy.replaySpeedChangedObservable = replaySpeedChangedObservable;

        fixture = TestBed.createComponent(TimerComponent);
        component = fixture.componentInstance;
        component.gameService = gameServiceSpy;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('addSeconds() should add seconds to the timer', () => {
        component.seconds = 0;
        component.addSeconds(10);
        expect(component.seconds).toEqual(10);
    });

    it('addSeconds() should not go over MAX value in coop', () => {
        component.gameService.gameInfo.gameMode = GameMode.TimeLimited;
        component.gameService.gameInfo.initialTime = 0;
        component.seconds = 0;
        component.addSeconds(Infinity);
        expect(component.seconds).toEqual(120);
    });

    it('addSeconds() should not go below 0', () => {
        component.gameService.gameInfo.initialTime = 0;
        component.seconds = 0;
        component.addSeconds(-Infinity);
        expect(component.seconds).toEqual(0);
    });

    it('start should call addSeconds with initialTime', () => {
        component.gameService.gameInfo.initialTime = 10;
        spyOn(component, 'addSeconds');
        component.start();
        expect(component.addSeconds).toHaveBeenCalledWith(10);
    });

    it('stop() should clear interval', () => {
        const clearIntervalSpy = spyOn(window, 'clearInterval');
        component.stop();
        expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('reset() should call stop and set seconds to 0', () => {
        spyOn(component, 'stop');
        component.reset();
        expect(component.stop).toHaveBeenCalled();
        expect(component.seconds).toEqual(0);
    });

    it('resume() should call setInterval', () => {
        const setIntervalSpy = spyOn(window, 'setInterval');
        component.resume(1);
        expect(setIntervalSpy).toHaveBeenCalled();
    });

    it('eventListener() should setup events timer', () => {
        component.setupEventListeners();
        const startSpy = spyOn(component, 'start');
        const stopSpy = spyOn(component, 'stop');

        timerSubject.next(true);
        expect(startSpy).toHaveBeenCalled();
        timerSubject.next(false);
        expect(stopSpy).toHaveBeenCalled();
    });

    it('eventListener() should setup events bonus', () => {
        component.setupEventListeners();
        const addSecondsSpy = spyOn(component, 'addSeconds');

        bonusSubject.next(5);
        expect(addSecondsSpy).toHaveBeenCalled();
    });

    it('eventListener() should setup events replayChanged', () => {
        component.setupEventListeners();
        const resumeSpy = spyOn(component, 'resume');
        const stopSpy = spyOn(component, 'stop');

        replaySpeedChangedSubject.next(5);
        expect(resumeSpy).toHaveBeenCalled();
        replaySpeedChangedSubject.next(0);
        expect(stopSpy).toHaveBeenCalled();
    });
});
