import { AirBrush } from './airbrush';
import SpyObj = jasmine.SpyObj;
import { HistoryEntryOf } from '@app/decorators/history/history';
import { PaintMode } from '@app/enums/paint-mode';
import { PaintService } from '@app/services/paint/paint.service';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Shape } from '@app/classes/shape/shape';

describe('AirBrush', () => {
    let airBrush: AirBrush;
    let fakePaintService: SpyObj<PaintService>;
    let fakeContext: CanvasRenderingContext2D;

    beforeEach(async () => {
        fakeContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        fakePaintService = jasmine.createSpyObj('PaintService', ['drawOnFront']);
        airBrush = new AirBrush(fakePaintService);

        fakePaintService.drawOnFront.and.callFake((action) => action(fakeContext));
    });

    it('should create', () => {
        expect(airBrush).toBeTruthy();
    });

    it('draw should call setInterval', () => {
        airBrush.draw({ position: { x: 5, y: 10 }, color: 'color', radius: 1 });
        expect(airBrush['intervalId']).toBeDefined();
    });

    it('end should call clearInterval', () => {
        airBrush.draw({ position: { x: 5, y: 10 }, color: 'color', radius: 1 });
        airBrush.end();
        expect(airBrush['intervalId']).toBeUndefined();
    });

    it('addToHistory should call parent', () => {
        const addToHistorySpy = spyOn(Shape.prototype, 'addToHistory');
        airBrush.addToHistory({} as HistoryEntryOf<AirBrush>);
        expect(addToHistorySpy).toHaveBeenCalled();
    });

    it('clearHistory should call parent', () => {
        const clearHistorySpy = spyOn(Shape.prototype, 'clearHistory');
        airBrush.clearHistory();
        expect(clearHistorySpy).toHaveBeenCalled();
    });

    it('getPaintMode should return AirBrush', () => {
        expect(airBrush.getPaintMode()).toEqual(PaintMode.AirBrush);
    });
});
