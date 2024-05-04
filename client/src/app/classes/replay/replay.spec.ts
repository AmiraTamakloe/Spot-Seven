/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Subject } from 'rxjs';
import { Replay } from './replay';

describe('Replay', () => {
    let replay: Replay;
    let setTimeoutSpy: jasmine.Spy<typeof setTimeout>;
    let fakeSubject: jasmine.SpyObj<Subject<number>>;

    beforeEach(() => {
        setTimeoutSpy = spyOn(window, 'setTimeout');
        fakeSubject = jasmine.createSpyObj('Subject', ['next']);
        replay = new Replay([], fakeSubject);
    });

    it('should be created', () => {
        expect(replay).toBeTruthy();
    });

    it('get finishedObservable() should return finishedSubject', () => {
        expect(replay.finishedObservable).toEqual(replay['finishedSubject'].asObservable());
    });

    it('get speed() should return _speed', () => {
        expect(replay.speed).toBe(replay['_speed']);
    });

    it('set speed() should set _speed', () => {
        replay.speed = 2;
        expect(replay['_speed']).toBe(2);
    });

    it('pause() should clear timeout', () => {
        const clearTimeoutSpy = spyOn(window, 'clearTimeout');
        replay['timeout'] = 1234 as any;
        replay['pause']();
        expect(clearTimeoutSpy).toHaveBeenCalledWith(1234);
        expect(replay['lastEntryTime']).toBe(0);
        expect(replay['timeout']).toBeUndefined();
    });

    it('resume() should schedule next entry', () => {
        const scheduleNextEntrySpy = spyOn<any>(replay, 'scheduleNextEntry');
        replay['timeout'] = undefined;
        replay['resume']();
        expect(scheduleNextEntrySpy).toHaveBeenCalled();
    });

    it('isPaused() should return true if timeout is undefined', () => {
        replay['timeout'] = undefined;
        expect(replay['isPaused']()).toBeTrue();
    });

    it('restart() should pause', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const pauseSpy = spyOn<any>(replay, 'pause').and.callFake(() => {});
        spyOn(Date, 'now').and.returnValue(5678);
        replay['lastEntryTime'] = 5678;
        replay['history'] = [1, 2, 3] as any;
        replay['initialHistory'] = [4, 5, 6] as any;
        replay['restart']();
        expect(pauseSpy).toHaveBeenCalled();
        expect(replay['history']).toEqual([4, 5, 6] as any);
    });

    it('scheduleNextEntry() should set timeout', () => {
        setTimeoutSpy.and.callFake(((callback: () => void) => {
            callback();
        }) as any);
        replay['history'] = [
            {
                time: 20,
                action: () => {
                    // This is here to make sure action is called
                    expect(true).toBeTrue();
                },
            },
        ] as any;
        replay['speed'] = 2;
        replay['scheduleNextEntry']();
        expect(setTimeoutSpy).toHaveBeenCalled();
    });

    it('scheduleNextEntry() should finish if history is empty', () => {
        const finishSpy = spyOn(replay['finishedSubject'], 'next');
        replay['history'] = [] as any;
        replay['scheduleNextEntry']();
        expect(finishSpy).toHaveBeenCalled();
    });
});
