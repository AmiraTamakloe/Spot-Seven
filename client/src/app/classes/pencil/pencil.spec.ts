/* eslint-disable @typescript-eslint/no-magic-numbers */
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { PaintMode } from '@app/enums/paint-mode';
import { PaintService } from '@app/services/paint/paint.service';
import { Pencil } from './pencil';

import SpyObj = jasmine.SpyObj;

describe('Pencil', () => {
    let pencil: Pencil;
    let fakePaintService: SpyObj<PaintService>;
    let fakeContext: CanvasRenderingContext2D;

    beforeEach(async () => {
        fakeContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        fakePaintService = jasmine.createSpyObj('PaintService', ['drawOnFront']);
        pencil = new Pencil(fakePaintService);

        fakePaintService.drawOnFront.and.callFake((action) => action(fakeContext));
    });

    it('should create', () => {
        expect(pencil).toBeTruthy();
    });

    it('draw should call drawOnFront and paint', () => {
        pencil['lastPosition'] = { x: 0, y: 0 };
        const contextFillSpy = spyOn(fakeContext, 'fill');
        const contextStrokeSpy = spyOn(fakeContext, 'stroke');
        const contextBeginPathSpy = spyOn(fakeContext, 'beginPath');
        const contextMoveToSpy = spyOn(fakeContext, 'moveTo');
        const contextLineToSpy = spyOn(fakeContext, 'lineTo');
        const position = { x: 5, y: 10 };
        pencil.draw({ position, color: 'color', radius: 1 });
        expect(contextBeginPathSpy).toHaveBeenCalledTimes(2);
        expect(contextMoveToSpy).toHaveBeenCalledWith(0, 0);
        expect(contextLineToSpy).toHaveBeenCalledWith(position.x, position.y);
        expect(contextStrokeSpy).toHaveBeenCalled();
        expect(contextFillSpy).toHaveBeenCalled();
        expect(fakePaintService.drawOnFront).toHaveBeenCalled();
    });

    it('getPaintMode should return Pencil', () => {
        expect(pencil.getPaintMode()).toEqual(PaintMode.Pencil);
    });
});
