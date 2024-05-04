/* eslint-disable @typescript-eslint/no-magic-numbers */
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Shape } from '@app/classes/shape/shape';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants';
import { PaintMode } from '@app/enums/paint-mode';
import { PaintService } from '@app/services/paint/paint.service';
import { Ellipse } from './ellipse';

import SpyObj = jasmine.SpyObj;

describe('Ellipse', () => {
    const startAngle = 0;
    const endAngle = 2 * Math.PI;
    const rotation = 0;

    let ellipse: Ellipse;
    let fakePaintService: SpyObj<PaintService>;
    let fakeContext: CanvasRenderingContext2D;

    beforeEach(async () => {
        fakeContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        fakePaintService = jasmine.createSpyObj('PaintService', ['drawOnTemp', 'drawOnFront']);
        ellipse = new Ellipse(fakePaintService);

        fakePaintService.drawOnTemp.and.callFake((action) => action(fakeContext));
        fakePaintService.drawOnFront.and.callFake((action) => action(fakeContext));
    });

    it('should create', () => {
        expect(ellipse).toBeTruthy();
    });

    it('begin should save begin position and call parent', () => {
        const position = { x: 5, y: 10 };
        const beginSpy = spyOn(Shape.prototype, 'begin');
        ellipse.begin(position);
        expect(ellipse['beginPosition']).toEqual(position);
        expect(beginSpy).toHaveBeenCalled();
    });

    it('draw should redraw ellipse', () => {
        const position = { x: 5, y: 10 };
        ellipse['beginPosition'] = { x: 0, y: 0 };
        const contextClearRectSpy = spyOn(fakeContext, 'clearRect');
        const contextEllipseSpy = spyOn(fakeContext, 'ellipse');
        ellipse.draw({ position, color: 'color', radius: 1 });
        expect(contextClearRectSpy).toHaveBeenCalledWith(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        expect(contextEllipseSpy).toHaveBeenCalledWith(0 + 5 / 2, 0 + 10 / 2, 5 / 2, 10 / 2, rotation, startAngle, endAngle);
        expect(fakePaintService.drawOnTemp).toHaveBeenCalled();
    });

    it('draw should redraw circle with shift', () => {
        const position = { x: 10, y: 20 };
        ellipse['beginPosition'] = { x: 50, y: 50 };
        const contextClearRectSpy = spyOn(fakeContext, 'clearRect');
        const contextEllipseSpy = spyOn(fakeContext, 'ellipse');
        ellipse.draw({ position, color: 'color', radius: 1, isShifted: true });
        expect(contextClearRectSpy).toHaveBeenCalledWith(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        expect(contextEllipseSpy).toHaveBeenCalledWith(35, 35, 15, 15, rotation, startAngle, endAngle);
        expect(fakePaintService.drawOnTemp).toHaveBeenCalled();
    });

    it('draw should do nothing if beginPosition is undefined', () => {
        const position = { x: 5, y: 10 };
        ellipse['beginPosition'] = undefined;
        const contextClearRectSpy = spyOn(fakeContext, 'clearRect');
        const contextEllipseSpy = spyOn(fakeContext, 'ellipse');
        ellipse.draw({ position, color: 'color', radius: 1 });
        expect(contextClearRectSpy).not.toHaveBeenCalled();
        expect(contextEllipseSpy).not.toHaveBeenCalled();
    });

    it('drawShape should not draw ellipse if beginPosition is undefined', () => {
        ellipse['beginPosition'] = undefined;
        const contextEllipseSpy = spyOn(fakeContext, 'ellipse');
        ellipse.drawShape(fakeContext, { x: 5, y: 10 }, false);
        expect(contextEllipseSpy).not.toHaveBeenCalled();
    });

    it('end should call draw ellipse and call parent', () => {
        const drawEllipseSpy = spyOn(ellipse, 'drawShape');
        const endSpy = spyOn(Shape.prototype, 'end');
        ellipse['lastOptions'] = { position: { x: 5, y: 10 }, color: 'color', radius: 1, isShifted: true };
        ellipse.end();
        expect(drawEllipseSpy).toHaveBeenCalledWith(fakeContext, ellipse['lastOptions'].position, ellipse['lastOptions'].isShifted);
        expect(endSpy).toHaveBeenCalled();
    });

    it('getPaintMode should return Ellipse', () => {
        expect(ellipse.getPaintMode()).toEqual(PaintMode.Ellipse);
    });
});
