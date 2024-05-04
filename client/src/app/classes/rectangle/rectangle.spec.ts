/* eslint-disable @typescript-eslint/no-magic-numbers */
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Shape } from '@app/classes/shape/shape';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants';
import { PaintMode } from '@app/enums/paint-mode';
import { PaintService } from '@app/services/paint/paint.service';
import { Rectangle } from './rectangle';

import SpyObj = jasmine.SpyObj;

describe('Rectangle', () => {
    let rectangle: Rectangle;
    let fakePaintService: SpyObj<PaintService>;
    let fakeContext: CanvasRenderingContext2D;

    beforeEach(async () => {
        fakeContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        fakePaintService = jasmine.createSpyObj('PaintService', ['drawOnTemp', 'drawOnFront']);
        rectangle = new Rectangle(fakePaintService);

        fakePaintService.drawOnTemp.and.callFake((action) => action(fakeContext));
        fakePaintService.drawOnFront.and.callFake((action) => action(fakeContext));
    });

    it('should create', () => {
        expect(rectangle).toBeTruthy();
    });

    it('begin should save begin position and call parent', () => {
        const position = { x: 5, y: 10 };
        const beginSpy = spyOn(Shape.prototype, 'begin');
        rectangle.begin(position);
        expect(rectangle['beginPosition']).toEqual(position);
        expect(beginSpy).toHaveBeenCalled();
    });

    it('draw should redraw rectangle', () => {
        const position = { x: 5, y: 10 };
        rectangle['beginPosition'] = { x: 0, y: 0 };
        const contextClearRectSpy = spyOn(fakeContext, 'clearRect');
        const contextFillRectSpy = spyOn(fakeContext, 'fillRect');
        rectangle.draw({ position, color: 'color', radius: 1 });
        expect(contextClearRectSpy).toHaveBeenCalledWith(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        expect(contextFillRectSpy).toHaveBeenCalledWith(0, 0, 5, 10);
        expect(fakePaintService.drawOnTemp).toHaveBeenCalled();
    });

    it('draw should redraw square with shift', () => {
        const position = { x: 10, y: 20 };
        rectangle['beginPosition'] = { x: 50, y: 50 };
        const contextClearRectSpy = spyOn(fakeContext, 'clearRect');
        const contextFillRectSpy = spyOn(fakeContext, 'fillRect');
        rectangle.draw({ position, color: 'color', radius: 1, isShifted: true });
        expect(contextClearRectSpy).toHaveBeenCalledWith(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        expect(contextFillRectSpy).toHaveBeenCalledWith(20, 20, 30, 30);
        expect(fakePaintService.drawOnTemp).toHaveBeenCalled();
    });

    it('draw should do nothing if beginPosition is undefined', () => {
        const position = { x: 5, y: 10 };
        rectangle['beginPosition'] = undefined;
        const contextClearRectSpy = spyOn(fakeContext, 'clearRect');
        const contextFillRectSpy = spyOn(fakeContext, 'fillRect');
        rectangle.draw({ position, color: 'color', radius: 1 });
        expect(contextClearRectSpy).not.toHaveBeenCalled();
        expect(contextFillRectSpy).not.toHaveBeenCalled();
    });

    it('drawShape should not draw rectangle if beginPosition is undefined', () => {
        rectangle['beginPosition'] = undefined;
        const contextFillRectSpy = spyOn(fakeContext, 'fillRect');
        rectangle.drawShape(fakeContext, { x: 5, y: 10 }, false);
        expect(contextFillRectSpy).not.toHaveBeenCalled();
    });

    it('end should call draw rectangle and call parent', () => {
        const drawRectangleSpy = spyOn(rectangle, 'drawShape');
        const endSpy = spyOn(Shape.prototype, 'end');
        rectangle['lastOptions'] = { position: { x: 5, y: 10 }, color: 'color', radius: 1, isShifted: true };
        rectangle.end();
        expect(drawRectangleSpy).toHaveBeenCalledWith(fakeContext, rectangle['lastOptions'].position, rectangle['lastOptions'].isShifted);
        expect(endSpy).toHaveBeenCalled();
    });

    it('getPaintMode should return Rectangle', () => {
        expect(rectangle.getPaintMode()).toEqual(PaintMode.Rectangle);
    });
});
