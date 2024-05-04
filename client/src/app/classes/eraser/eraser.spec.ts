/* eslint-disable @typescript-eslint/no-magic-numbers */
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { PaintMode } from '@app/enums/paint-mode';
import { PaintService } from '@app/services/paint/paint.service';
import { Eraser } from './eraser';

import SpyObj = jasmine.SpyObj;

describe('Eraser', () => {
    let eraser: Eraser;
    let fakePaintService: SpyObj<PaintService>;
    let fakeContext: CanvasRenderingContext2D;

    beforeEach(async () => {
        fakeContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        fakePaintService = jasmine.createSpyObj('PaintService', ['drawOnFront']);
        eraser = new Eraser(fakePaintService);

        fakePaintService.drawOnFront.and.callFake((action) => action(fakeContext));
    });

    it('should create', () => {
        expect(eraser).toBeTruthy();
    });

    it('draw should call drawOnFront', () => {
        // @ts-expect-error this function is supposed to exist
        const positionsToDrawSpy = spyOn(eraser, 'getPositionsToDraw').and.returnValue([{ x: 0, y: 0 }]);
        const contextClearRectSpy = spyOn(fakeContext, 'clearRect');
        const position = { x: 5, y: 10 };
        eraser.draw({ position, color: 'color', radius: 1 });
        expect(positionsToDrawSpy).toHaveBeenCalledWith(position);
        expect(contextClearRectSpy).toHaveBeenCalledWith(-1, -1, 2, 2);
    });

    it('getPaintMode should return Eraser', () => {
        expect(eraser.getPaintMode()).toEqual(PaintMode.Eraser);
    });
});
