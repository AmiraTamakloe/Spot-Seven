/* eslint-disable deprecation/deprecation */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { CanvasAction } from '@app/interfaces/canvas-action';
import { CanvasEditorService } from '@app/services/canvas-editor/canvas-editor.service';
import { GameService } from '@app/services/game-service/game.service';
import { ImageArea } from '@common/enums/image-area';
import { Observable, Subject } from 'rxjs';
import { DrawInstructionsManager } from './draw-instructions-manager';
import { DRAW_FREQUENCY } from './draw-instructions-manager.constants';

describe('DrawInstructionsManager', () => {
    let manager: DrawInstructionsManager;
    let actionErrorSubjectSpy: jasmine.SpyObj<Subject<CanvasAction>>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let canvasEditorSpy: jasmine.SpyObj<CanvasEditorService>;
    let replaySpeedChangedObservableSpy: jasmine.SpyObj<Observable<number>>;
    let setIntervalSpy: jasmine.Spy;
    let clearTimeoutSpy: jasmine.Spy;

    beforeEach(() => {
        actionErrorSubjectSpy = jasmine.createSpyObj('Subject', ['next']);
        gameServiceSpy = jasmine.createSpyObj('GameService', ['']);
        canvasEditorSpy = jasmine.createSpyObj('CanvasEditorService', ['getContexts', 'clearCanvas']);
        replaySpeedChangedObservableSpy = jasmine.createSpyObj('Observable', ['subscribe']);
        gameServiceSpy.canvasEditorService = canvasEditorSpy;
        gameServiceSpy.replaySpeedChangedObservable = replaySpeedChangedObservableSpy;
        setIntervalSpy = spyOn(window, 'setInterval');
        clearTimeoutSpy = spyOn(window, 'clearTimeout');

        // @ts-expect-error the case where it is undefined should not happen in tests
        gameServiceSpy.replaySpeedChangedObservable.subscribe.and.callFake((callback) => {
            callback(1);
            return { unsubscribe: () => {} };
        });

        manager = new DrawInstructionsManager(actionErrorSubjectSpy, gameServiceSpy);

        expect(gameServiceSpy.replaySpeedChangedObservable.subscribe).toHaveBeenCalled();
        expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('scheduleExecution() should execute draw instructions every 100 ms', async () => {
        const leftContext = CanvasTestHelper.createCanvas().getContext('2d')!;
        const rightContext = CanvasTestHelper.createCanvas().getContext('2d')!;

        const leftFillRectSpy = spyOn(leftContext, 'fillRect');
        const rightFillRectSpy = spyOn(rightContext, 'fillRect');

        canvasEditorSpy.getContexts.and.returnValue(Promise.resolve({ leftContext, rightContext }));

        manager['instructions'] = [
            {
                action: (ctx, i) => {
                    expect(i).toEqual(0);
                    expect(ctx).toEqual(leftContext);
                    ctx.fillRect(0, 0, 1, 1);
                },
                imageArea: ImageArea.ORIGINAL,
            },
            {
                action: (ctx) => {
                    expect(ctx).toEqual(rightContext);
                    ctx.fillRect(1, 0, 1, 1);
                },
                imageArea: ImageArea.MODIFIED,
            },
            {
                action: (ctx) => {
                    ctx.fillRect(1, 1, 1, 1);
                },
                imageArea: ImageArea.BOTH,
                executionsLeft: 50,
            },
            {
                action: (ctx) => {
                    ctx.fillRect(2, 2, 2, 2);
                },
                imageArea: ImageArea.BOTH,
                executionsLeft: 0,
            },
        ];

        const promise = new Promise<void>((resolve) => {
            setIntervalSpy.and.callFake((async (callback: () => Promise<void>, freq: number) => {
                expect(freq).toEqual(DRAW_FREQUENCY);
                await callback();
                resolve();
            }) as any);
            manager['scheduleExecution'](1);
        });

        await promise;

        expect(canvasEditorSpy.clearCanvas).toHaveBeenCalledWith(leftContext, true);
        expect(canvasEditorSpy.clearCanvas).toHaveBeenCalledWith(rightContext, true);
        expect(leftFillRectSpy).toHaveBeenCalledWith(0, 0, 1, 1);
        expect(rightFillRectSpy).toHaveBeenCalledWith(1, 0, 1, 1);
        expect(leftFillRectSpy).toHaveBeenCalledWith(1, 1, 1, 1);
        expect(rightFillRectSpy).toHaveBeenCalledWith(1, 1, 1, 1);
        expect(leftFillRectSpy).not.toHaveBeenCalledWith(2, 2, 2, 2);
        expect(rightFillRectSpy).not.toHaveBeenCalledWith(2, 2, 2, 2);

        expect(manager['instructions'].length).toEqual(3);
    });

    it('stopExecution() should stop execution', () => {
        manager['stopExecution']();
        expect(clearTimeoutSpy).toHaveBeenCalled();
    });
});
