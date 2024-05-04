import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants';
import { PaintService } from '@app/services/paint/paint.service';
import { Bucket } from './bucket';
import { HistoryEntryOf } from '@app/decorators/history/history';
import { Shape } from '@app/classes/shape/shape';
import { DrawOptions } from '@app/interfaces/shape';
import { PaintMode } from '@app/enums/paint-mode';
import SpyObj = jasmine.SpyObj;

describe('Bucket', () => {
    let bucket: Bucket;
    let fakePaintService: SpyObj<PaintService>;
    let fakeContext: CanvasRenderingContext2D;

    beforeEach(async () => {
        fakeContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        fakePaintService = jasmine.createSpyObj('PaintService', ['drawOnFront']);
        bucket = new Bucket(fakePaintService);
        fakePaintService.drawOnFront.and.callFake((action) => action(fakeContext));
    });

    it('should create', () => {
        expect(bucket).toBeTruthy();
    });

    it('bfsColorReplacement should replace color', () => {
        const position = { x: 0, y: 0 };
        const imageData = fakeContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT).data;
        const contextFillRectSpy = spyOn(fakeContext, 'fillRect');
        bucket.bfsColorReplacement(imageData, position, 'color', fakeContext);
        expect(contextFillRectSpy).toHaveBeenCalled();
    });

    it('addToHistory should call parent', () => {
        const addToHistorySpy = spyOn(Shape.prototype, 'addToHistory');
        bucket.addToHistory({} as HistoryEntryOf<Bucket>);
        expect(addToHistorySpy).toHaveBeenCalled();
    });

    it('clearHistory should call parent', () => {
        const clearHistorySpy = spyOn(Shape.prototype, 'clearHistory');
        bucket.clearHistory();
        expect(clearHistorySpy).toHaveBeenCalled();
    });

    it('draw should call drawOnFront', () => {
        const drawOptions: DrawOptions = { position: { x: 0, y: 0 }, color: 'color', radius: 1 };
        bucket.draw(drawOptions);
        expect(fakePaintService.drawOnFront).toHaveBeenCalled();
    });

    it('getPaintMode should return PaintMode.Bucket', () => {
        expect(bucket.getPaintMode()).toBe(PaintMode.Bucket);
    });
});
