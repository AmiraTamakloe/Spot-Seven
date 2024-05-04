/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Eraser } from '@app/classes/eraser/eraser';
import { Pencil } from '@app/classes/pencil/pencil';
import { Rectangle } from '@app/classes/rectangle/rectangle';
import { MouseButton } from '@app/enums/mouse-button';
import { PaintMode } from '@app/enums/paint-mode';
import { HistoryItem } from '@app/interfaces/history';

import { HistoryItemType } from '@app/enums/history-item-type';
import { CanvasEditorService } from '@app/services/canvas-editor/canvas-editor.service';
import { PaintService } from '@app/services/paint/paint.service';
import { ImageArea } from '@common/enums/image-area';

import SpyObj = jasmine.SpyObj;

describe('PaintService', () => {
    let service: PaintService;
    let fakeMouseEvent: MouseEvent;
    let canvasEditorServiceSpy: SpyObj<CanvasEditorService>;
    let frontImageSubjectSpy: jasmine.Spy;
    let tempImageSubjectSpy: jasmine.Spy;
    let fakeContext: CanvasRenderingContext2D;

    beforeEach(() => {
        fakeContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;

        canvasEditorServiceSpy = jasmine.createSpyObj('CanvasEditorService', [
            'clearCanvas',
            'replaceImageData',
            'intervertImageData',
            'getContexts',
        ]);

        TestBed.configureTestingModule({
            providers: [{ provide: CanvasEditorService, useValue: canvasEditorServiceSpy }],
        });
        service = TestBed.inject(PaintService);

        frontImageSubjectSpy = spyOn(service['frontImageSubject'], 'next').and.callFake((canvasAction) => canvasAction.action(fakeContext));
        tempImageSubjectSpy = spyOn(service['tempImageSubject'], 'next').and.callFake((canvasAction) => canvasAction.action(fakeContext));

        fakeMouseEvent = {
            offsetX: 10,
            offsetY: 20,
            button: MouseButton.Left,
            shiftKey: false,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('reset should reset all attributes', () => {
        service['history'] = [{} as HistoryItem];
        service['historyIndex'] = 1;
        service['mode'] = PaintMode.Pencil as PaintMode;
        service['shape'] = new Pencil(service);
        service['paintArea'] = ImageArea.BOTH;
        service['color'] = 'red';
        service['radius'] = 10;
        service.reset();
        expect(service['history']).toEqual([]);
        expect(service['historyIndex']).toEqual(0);
        expect(service['mode']).toEqual(PaintMode.None);
        expect(service['shape']).toBeUndefined();
        expect(service['paintArea']).toBeUndefined();
        expect(service['color']).toEqual('000000');
        expect(service['radius']).toEqual(5);
    });

    it('onMouseUp should add to history', () => {
        const pushToHistorySpy = spyOn(service, 'pushToHistory');
        service['shape'] = new Pencil(service);
        const shapeEndSpy = spyOn(service['shape'], 'end').and.returnValue({ paintMode: PaintMode.Pencil, commands: [] });
        service['paintArea'] = ImageArea.BOTH;
        service.onMouseUp();
        expect(pushToHistorySpy).toHaveBeenCalledWith({
            type: HistoryItemType.Shape,
            command: { paintMode: PaintMode.Pencil, commands: [] },
            paintArea: ImageArea.BOTH,
        });
        expect(shapeEndSpy).toHaveBeenCalled();
    });

    it('onMouseUp should not add to history if paintArea is undefined', () => {
        const pushToHistorySpy = spyOn(service, 'pushToHistory');
        service['shape'] = new Pencil(service);
        const shapeEndSpy = spyOn(service['shape'], 'end').and.returnValue({ paintMode: PaintMode.Pencil, commands: [] });
        service['paintArea'] = undefined;
        service.onMouseUp();
        expect(pushToHistorySpy).not.toHaveBeenCalled();
        expect(shapeEndSpy).not.toHaveBeenCalled();
    });

    it('setMode should set mode', () => {
        service.setMode(PaintMode.Pencil);
        expect(service['mode']).toEqual(PaintMode.Pencil);
        expect(service['shape']).toBeInstanceOf(Pencil);

        service.setMode(PaintMode.Eraser);
        expect(service['mode']).toEqual(PaintMode.Eraser);
        expect(service['shape']).toBeInstanceOf(Eraser);

        service.setMode(PaintMode.Rectangle);
        expect(service['mode']).toEqual(PaintMode.Rectangle);
        expect(service['shape']).toBeInstanceOf(Rectangle);
    });

    it('setMode should not set mode if paintArea is not undefined', () => {
        service['paintArea'] = ImageArea.BOTH;
        service.setMode(PaintMode.Pencil);
        expect(service['mode']).toEqual(PaintMode.None);
        expect(service['shape']).toBeUndefined();
    });

    it('getPositionFromEvent should return position', () => {
        const position = service.getPositionFromEvent(fakeMouseEvent);
        expect(position.x).toEqual(10);
        expect(position.y).toEqual(20);
    });

    it('onMouseDown should set paintArea and start drawing', () => {
        service['mode'] = PaintMode.Pencil;
        service['shape'] = new Pencil(service);

        const shapeBeginSpy = spyOn(service['shape'], 'begin').and.callFake(() => undefined);
        const shapeDrawSpy = spyOn(service['shape'], 'draw').and.callFake(() => undefined);

        service.onMouseDown(ImageArea.BOTH, fakeMouseEvent);
        expect(service['paintArea']).toEqual(ImageArea.BOTH);

        expect(shapeBeginSpy).toHaveBeenCalledWith({ x: 10, y: 20 });
        expect(shapeDrawSpy).toHaveBeenCalledWith({ position: { x: 10, y: 20 }, color: '000000', radius: 5 });
    });

    it('onMouseDown should not set paintArea if button is not left', () => {
        service['mode'] = PaintMode.Pencil;
        service['shape'] = new Pencil(service);

        const shapeBeginSpy = spyOn(service['shape'], 'begin').and.callFake(() => undefined);
        const shapeDrawSpy = spyOn(service['shape'], 'draw').and.callFake(() => undefined);

        service.onMouseDown(ImageArea.BOTH, { ...fakeMouseEvent, button: MouseButton.Right });
        expect(service['paintArea']).toBeUndefined();

        expect(shapeBeginSpy).not.toHaveBeenCalled();
        expect(shapeDrawSpy).not.toHaveBeenCalled();
    });

    it('onMouseMove should draw', () => {
        service['mode'] = PaintMode.Pencil;
        service['shape'] = new Pencil(service);
        service['paintArea'] = ImageArea.ORIGINAL;

        const shapeDrawSpy = spyOn(service['shape'], 'draw').and.callFake(() => undefined);

        service.onMouseMove(ImageArea.ORIGINAL, fakeMouseEvent);
        expect(shapeDrawSpy).toHaveBeenCalledWith({ position: { x: 10, y: 20 }, color: '000000', radius: 5, isShifted: false });
    });

    it('onMouseMove should not draw if paintArea is undefined', () => {
        service['mode'] = PaintMode.Pencil;
        service['shape'] = new Pencil(service);
        service['paintArea'] = undefined;

        const shapeDrawSpy = spyOn(service['shape'], 'draw').and.callFake(() => undefined);

        service.onMouseMove(ImageArea.ORIGINAL, fakeMouseEvent);
        expect(shapeDrawSpy).not.toHaveBeenCalled();
    });

    it('onMouseLeave should pause drawing', () => {
        service['mode'] = PaintMode.Pencil;
        service['shape'] = new Pencil(service);
        service['paintArea'] = ImageArea.ORIGINAL;

        const shapeDrawSpy = spyOn(service['shape'], 'draw').and.callFake(() => undefined);
        const shapePauseSpy = spyOn(service['shape'], 'pause').and.callFake(() => undefined);

        service.onMouseLeave(ImageArea.ORIGINAL, fakeMouseEvent);
        expect(shapeDrawSpy).toHaveBeenCalledWith({ position: { x: 10, y: 20 }, color: '000000', radius: 5, isShifted: false });
        expect(shapePauseSpy).toHaveBeenCalled();
    });

    it('onMouseLeave should not pause drawing if paintArea is undefined', () => {
        service['mode'] = PaintMode.Pencil;
        service['shape'] = new Pencil(service);
        service['paintArea'] = undefined;

        const shapeDrawSpy = spyOn(service['shape'], 'draw').and.callFake(() => undefined);
        const shapePauseSpy = spyOn(service['shape'], 'pause').and.callFake(() => undefined);

        service.onMouseLeave(ImageArea.ORIGINAL, fakeMouseEvent);
        expect(shapeDrawSpy).not.toHaveBeenCalled();
        expect(shapePauseSpy).not.toHaveBeenCalled();
    });

    it('drawOnTemp should draw on temp canvas', () => {
        service['paintArea'] = ImageArea.ORIGINAL;
        const action = (ctx: CanvasRenderingContext2D) => ctx.fillRect(0, 0, 10, 10);
        service.drawOnTemp(action);
        expect(tempImageSubjectSpy).toHaveBeenCalledWith({ imageArea: ImageArea.ORIGINAL, action });
    });

    it('drawOnTemp should not draw on temp canvas if paintArea is undefined', () => {
        service['paintArea'] = undefined;
        const action = (ctx: CanvasRenderingContext2D) => ctx.fillRect(0, 0, 10, 10);
        service.drawOnTemp(action);
        expect(tempImageSubjectSpy).not.toHaveBeenCalled();
    });

    it('drawOnFront should draw on front canvas', () => {
        service['paintArea'] = ImageArea.ORIGINAL;

        const action = (ctx: CanvasRenderingContext2D) => ctx.fillRect(0, 0, 10, 10);
        service.drawOnFront(action);
        expect(frontImageSubjectSpy).toHaveBeenCalledWith({ imageArea: ImageArea.ORIGINAL, action });
    });

    it('drawOnFront should not draw on front canvas if paintArea is undefined', () => {
        service['paintArea'] = undefined;

        const action = (ctx: CanvasRenderingContext2D) => ctx.fillRect(0, 0, 10, 10);
        service.drawOnFront(action);
        expect(frontImageSubjectSpy).not.toHaveBeenCalled();
    });

    it('pushToHistory should push to history', () => {
        const historyPushSpy = spyOn(service['history'], 'push');
        const command = { paintMode: PaintMode.Pencil, commands: [() => undefined] };
        const historyItem: HistoryItem = { type: HistoryItemType.Shape, command, paintArea: ImageArea.ORIGINAL };
        service.pushToHistory(historyItem);
        expect(historyPushSpy).toHaveBeenCalledWith(historyItem);
    });

    it('pushToHistory should splice if historyIndex is different from history length', () => {
        const historyPushSpy = spyOn(service['history'], 'push');
        const historySpliceSpy = spyOn(service['history'], 'splice');
        const command = { paintMode: PaintMode.Pencil, commands: [() => undefined] };
        const historyItem: HistoryItem = { type: HistoryItemType.Shape, command, paintArea: ImageArea.ORIGINAL };
        service['history'].length = 2;
        service.pushToHistory(historyItem);
        expect(historySpliceSpy).toHaveBeenCalled();
        expect(historyPushSpy).toHaveBeenCalledWith(historyItem);
    });

    it('clearCanvas should clear canvas', () => {
        const pushToHistorySpy = spyOn(service, 'pushToHistory');
        service.clearCanvas(ImageArea.ORIGINAL);
        expect(canvasEditorServiceSpy.clearCanvas).toHaveBeenCalledWith(fakeContext);
        expect(pushToHistorySpy).toHaveBeenCalled();
    });

    it('cleanCanvas with save to false should not push to history', () => {
        const pushToHistorySpy = spyOn(service, 'pushToHistory');
        service.clearCanvas(ImageArea.ORIGINAL, false);
        expect(canvasEditorServiceSpy.clearCanvas).toHaveBeenCalledWith(fakeContext);
        expect(pushToHistorySpy).not.toHaveBeenCalled();
    });

    it('clearCanvas should not clear canvas if paintArea is defined', () => {
        service['paintArea'] = ImageArea.ORIGINAL;
        service.clearCanvas(ImageArea.ORIGINAL, true);
        expect(canvasEditorServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });

    it('duplicate should duplicate canvas from left to right if imageArea is ORIGINAL', async () => {
        const leftContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        const rightContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        spyOn(service, 'getFrontContexts').and.returnValue(Promise.resolve({ leftContext, rightContext }));
        const pushToHistorySpy = spyOn(service, 'pushToHistory');
        await service.duplicate(ImageArea.ORIGINAL, true);
        expect(canvasEditorServiceSpy.replaceImageData).toHaveBeenCalledWith(leftContext, rightContext);
        expect(pushToHistorySpy).toHaveBeenCalled();
    });

    it('duplicate should duplicate canvas from right to left if imageArea is MODIFIED', async () => {
        const leftContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        const rightContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        spyOn(service, 'getFrontContexts').and.returnValue(Promise.resolve({ leftContext, rightContext }));
        const pushToHistorySpy = spyOn(service, 'pushToHistory');
        await service.duplicate(ImageArea.MODIFIED);
        expect(canvasEditorServiceSpy.replaceImageData).toHaveBeenCalledWith(rightContext, leftContext);
        expect(pushToHistorySpy).toHaveBeenCalled();
    });

    it('duplicate should not duplicate canvas if paintArea is defined', async () => {
        service['paintArea'] = ImageArea.ORIGINAL;
        await service.duplicate(ImageArea.ORIGINAL);
        expect(canvasEditorServiceSpy.replaceImageData).not.toHaveBeenCalled();
    });

    it('intervert should intervert canvas from left and right', async () => {
        const leftContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        const rightContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        spyOn(service, 'getFrontContexts').and.returnValue(Promise.resolve({ leftContext, rightContext }));
        const pushToHistorySpy = spyOn(service, 'pushToHistory');
        await service.intervert();
        expect(canvasEditorServiceSpy.intervertImageData).toHaveBeenCalledWith(leftContext, rightContext);
        expect(pushToHistorySpy).toHaveBeenCalled();
    });

    it('intervert should not intervert canvas if paintArea is defined', async () => {
        service['paintArea'] = ImageArea.ORIGINAL;
        await service.intervert();
        expect(canvasEditorServiceSpy.intervertImageData).not.toHaveBeenCalled();
    });

    it('getFrontContexts should return both contexts', async () => {
        const leftContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        const rightContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        canvasEditorServiceSpy.getContexts.and.returnValue(Promise.resolve({ leftContext, rightContext }));
        const result = await service.getFrontContexts();
        expect(result).toEqual({ leftContext, rightContext });
    });

    it('createShapeFromPaintMode should return a shape depending on paintMode', () => {
        const shape = service.createShapeFromPaintMode(PaintMode.Pencil);
        expect(shape).toBeInstanceOf(Pencil);

        const shape2 = service.createShapeFromPaintMode(PaintMode.Eraser);
        expect(shape2).toBeInstanceOf(Eraser);

        const shape3 = service.createShapeFromPaintMode(PaintMode.Rectangle);
        expect(shape3).toBeInstanceOf(Rectangle);

        const nullShape = service.createShapeFromPaintMode(PaintMode.None);
        expect(nullShape).toBeNull();
    });

    it('executeShapeHistoryItem should execute a shape history item', () => {
        const pencil = new Pencil(service);
        const createShapeSpy = spyOn(service, 'createShapeFromPaintMode').and.returnValue(pencil);
        const pencilExecuteFromCommandSpy = spyOn(pencil, 'executeFromCommand');
        const historyItem: HistoryItem = {
            type: HistoryItemType.Shape,
            command: { paintMode: PaintMode.Pencil, commands: [() => undefined] },
            paintArea: ImageArea.ORIGINAL,
        };
        service.executeShapeHistoryItem(historyItem);
        expect(createShapeSpy).toHaveBeenCalledWith(PaintMode.Pencil);
        expect(pencilExecuteFromCommandSpy).toHaveBeenCalledWith(historyItem.command);
    });

    it('executeShapeHistoryItem should throw if shape is null', () => {
        const createShapeSpy = spyOn(service, 'createShapeFromPaintMode').and.returnValue(null);
        const historyItem: HistoryItem = {
            type: HistoryItemType.Shape,
            command: { paintMode: PaintMode.None, commands: [() => undefined] },
            paintArea: ImageArea.ORIGINAL,
        };
        expect(() => service.executeShapeHistoryItem(historyItem)).toThrowError();
        expect(createShapeSpy).toHaveBeenCalledWith(PaintMode.None);
    });

    it('executeHistoryItem should execute any history item', async () => {
        const executeShapeHistoryItemSpy = spyOn(service, 'executeShapeHistoryItem');
        const historyItem: HistoryItem = {
            type: HistoryItemType.Shape,
            command: { paintMode: PaintMode.Pencil, commands: [() => undefined] },
            paintArea: ImageArea.ORIGINAL,
        };
        await service.executeHistoryItem(historyItem);
        expect(executeShapeHistoryItemSpy).toHaveBeenCalledWith(historyItem);

        const clearCanvasSpy = spyOn(service, 'clearCanvas');
        const historyItem2: HistoryItem = { type: HistoryItemType.Clear, paintArea: ImageArea.ORIGINAL };
        await service.executeHistoryItem(historyItem2);
        expect(clearCanvasSpy).toHaveBeenCalledWith(ImageArea.ORIGINAL, false);

        const duplicateSpy = spyOn(service, 'duplicate');
        const historyItem3: HistoryItem = { type: HistoryItemType.Duplicate, paintArea: ImageArea.ORIGINAL };
        await service.executeHistoryItem(historyItem3);
        expect(duplicateSpy).toHaveBeenCalledWith(ImageArea.ORIGINAL, false);

        const intervertSpy = spyOn(service, 'intervert');
        const historyItem4: HistoryItem = { type: HistoryItemType.Intervert };
        await service.executeHistoryItem(historyItem4);
        expect(intervertSpy).toHaveBeenCalledWith(false);
    });

    it('undo should undo last history item', async () => {
        canvasEditorServiceSpy.getContexts.and.returnValue(Promise.resolve({ leftContext: fakeContext, rightContext: fakeContext }));
        canvasEditorServiceSpy.clearCanvas.and.returnValue();
        const executeHistoryItemSpy = spyOn(service, 'executeHistoryItem');
        const historyItem: HistoryItem = {
            type: HistoryItemType.Shape,
            command: { paintMode: PaintMode.Pencil, commands: [() => undefined] },
            paintArea: ImageArea.ORIGINAL,
        };
        service['history'].push(historyItem);
        service['history'].push(historyItem);
        service['historyIndex'] = 2;
        await service.undo();
        expect(executeHistoryItemSpy).toHaveBeenCalledWith(historyItem);
        expect(service['historyIndex']).toEqual(1);
    });

    it('undo should not undo if history is empty', async () => {
        const executeHistoryItemSpy = spyOn(service, 'executeHistoryItem');
        await service.undo();
        expect(executeHistoryItemSpy).not.toHaveBeenCalled();
    });

    it('redo should redo last history item', async () => {
        canvasEditorServiceSpy.getContexts.and.returnValue(Promise.resolve({ leftContext: fakeContext, rightContext: fakeContext }));
        canvasEditorServiceSpy.clearCanvas.and.returnValue();
        const executeHistoryItemSpy = spyOn(service, 'executeHistoryItem');
        const historyItem: HistoryItem = {
            type: HistoryItemType.Shape,
            command: { paintMode: PaintMode.Pencil, commands: [() => undefined] },
            paintArea: ImageArea.ORIGINAL,
        };
        service['history'].push(historyItem);
        service['historyIndex'] = 0;
        await service.redo();
        expect(executeHistoryItemSpy).toHaveBeenCalledWith(historyItem);
        expect(service['historyIndex']).toEqual(1);
    });

    it('redo should not redo if we are at the end of history', async () => {
        const executeHistoryItemSpy = spyOn(service, 'executeHistoryItem');
        await service.redo();
        expect(executeHistoryItemSpy).not.toHaveBeenCalled();
    });

    it('changeColor should change the current color', () => {
        const color = 'red';
        const fakeEvent = { target: { value: color } } as unknown as Event;
        service.changeColor(fakeEvent);
        expect(service['color']).toEqual(color);
    });

    it('changeRadius should change the current radius', () => {
        const radius = 2;
        const fakeEvent = { target: { value: radius } } as unknown as Event;
        service.changeRadius(fakeEvent);
        expect(service['radius']).toEqual(radius);
    });

    it('changeRadius should do nothing is paintArea is defined', () => {
        service['paintArea'] = ImageArea.ORIGINAL;
        const radius = 2;
        const fakeEvent = { target: { value: radius } } as unknown as Event;
        service.changeRadius(fakeEvent);
        expect(service['radius']).not.toEqual(radius);
    });
});
