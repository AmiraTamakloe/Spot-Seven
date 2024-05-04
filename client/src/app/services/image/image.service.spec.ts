// Used to spy on the private attributes
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants';

import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { CanvasEditorService } from '@app/services/canvas-editor/canvas-editor.service';
import { CanvasToBase64Service } from '@app/services/canvas-to-base64/canvas-to-base64.service';
import { PaintService } from '@app/services/paint/paint.service';
import { ImageArea } from '@common/enums/image-area';
import { ImageService } from './image.service';

import SpyObj = jasmine.SpyObj;
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';

describe('ImageService', () => {
    const CANVAS_STARTING_POS_X = 0;
    const CANVAS_STARTING_POS_Y = 0;
    const CANVAS_WIDTH = IMAGE_WIDTH;
    const CANVAS_HEIGHT = IMAGE_HEIGHT;
    const testImage: HTMLImageElement = document.createElement('img');

    let originalContextStub: CanvasRenderingContext2D;
    let modifiedContextStub: CanvasRenderingContext2D;
    let service: ImageService;
    let canvasEditorServiceSpy: SpyObj<CanvasEditorService>;
    let paintServiceSpy: SpyObj<PaintService>;
    let canvasToBase64ServiceSpy: SpyObj<CanvasToBase64Service>;

    beforeEach(() => {
        testImage.src = 'test_image.png';

        canvasEditorServiceSpy = jasmine.createSpyObj(CanvasEditorService, ['clearCanvas', 'getContexts', 'getFullImageData', 'mergeImageDatas']);
        paintServiceSpy = jasmine.createSpyObj(PaintService, ['getFrontContexts']);
        canvasToBase64ServiceSpy = jasmine.createSpyObj(CanvasToBase64Service, ['convertToBase64']);

        TestBed.configureTestingModule({
            providers: [
                { provide: CanvasEditorService, useValue: canvasEditorServiceSpy },
                { provide: PaintService, useValue: paintServiceSpy },
                { provide: CanvasToBase64Service, useValue: canvasToBase64ServiceSpy },
            ],
            imports: [...getTranslocoTestingModules()],
        });
        service = TestBed.inject(ImageService);

        originalContextStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.actionImageObservable.subscribe(CanvasTestHelper.createCanvasObserver(originalContextStub, ImageArea.ORIGINAL));

        modifiedContextStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.actionImageObservable.subscribe(CanvasTestHelper.createCanvasObserver(modifiedContextStub, ImageArea.MODIFIED));
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('width should return the canvas width', () => {
        expect(service.width).toEqual(CANVAS_WIDTH);
    });

    it('height return the canvas height', () => {
        expect(service.height).toEqual(CANVAS_HEIGHT);
    });

    it('setImageAsBackground should call the original context drawImage when called with ImageArea.ORIGINAL', () => {
        const drawImageOriginalSpy = spyOn<any>(originalContextStub, 'drawImage');
        const drawImageModifiedSpy = spyOn<any>(modifiedContextStub, 'drawImage');

        service.setImageAsBackground(testImage, ImageArea.ORIGINAL);

        expect(drawImageOriginalSpy).toHaveBeenCalledWith(testImage, CANVAS_STARTING_POS_X, CANVAS_STARTING_POS_Y);
        expect(drawImageModifiedSpy).not.toHaveBeenCalled();
    });

    it('setImageAsBackground should call the modified context drawImage when called with ImageArea.MODIFIED', () => {
        const drawImageOriginalSpy = spyOn<any>(originalContextStub, 'drawImage');
        const drawImageModifiedSpy = spyOn<any>(modifiedContextStub, 'drawImage');

        service.setImageAsBackground(testImage, ImageArea.MODIFIED);

        expect(drawImageOriginalSpy).not.toHaveBeenCalled();
        expect(drawImageModifiedSpy).toHaveBeenCalledWith(testImage, CANVAS_STARTING_POS_X, CANVAS_STARTING_POS_Y);
    });

    it('setImageAsBackground should call the both contexts drawImage when called with ImageArea.BOTH', () => {
        const drawImageOriginalSpy = spyOn<any>(originalContextStub, 'drawImage');
        const drawImageModifiedSpy = spyOn<any>(modifiedContextStub, 'drawImage');

        service.setImageAsBackground(testImage, ImageArea.BOTH);

        expect(drawImageOriginalSpy).toHaveBeenCalledWith(testImage, CANVAS_STARTING_POS_X, CANVAS_STARTING_POS_Y);
        expect(drawImageModifiedSpy).toHaveBeenCalledWith(testImage, CANVAS_STARTING_POS_X, CANVAS_STARTING_POS_Y);
    });

    it('clearCanvas should clear the original image canvas when called with ImageArea.ORIGINAL', () => {
        service.clearCanvas(ImageArea.ORIGINAL);
        expect(canvasEditorServiceSpy.clearCanvas).toHaveBeenCalledWith(originalContextStub);
    });

    it('clearCanvas should clear the modified image canvas when called with ImageArea.MODIFIED', () => {
        service.clearCanvas(ImageArea.MODIFIED);
        expect(canvasEditorServiceSpy.clearCanvas).toHaveBeenCalledWith(originalContextStub);
    });

    it('clearCanvas should clear both canvases when called with ImageArea.BOTH', () => {
        service.clearCanvas(ImageArea.BOTH);
        expect(canvasEditorServiceSpy.clearCanvas).toHaveBeenCalledWith(originalContextStub);
    });

    it('getImages as base64 should merge front and back and convert to base64', async () => {
        canvasEditorServiceSpy.getContexts.and.returnValue(
            Promise.resolve({
                leftContext: originalContextStub,
                rightContext: modifiedContextStub,
            }),
        );

        const leftFrontContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        const rightFrontContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        paintServiceSpy.getFrontContexts.and.returnValue(
            Promise.resolve({
                leftContext: leftFrontContext,
                rightContext: rightFrontContext,
            }),
        );

        canvasEditorServiceSpy.getFullImageData.and.returnValues(
            originalContextStub.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT).data,
            modifiedContextStub.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT).data,
            leftFrontContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT).data,
            rightFrontContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT).data,
        );
        canvasEditorServiceSpy.mergeImageDatas.and.returnValues(
            originalContextStub.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT).data,
            modifiedContextStub.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT).data,
        );

        await service.getImagesAsBase64();

        expect(canvasEditorServiceSpy.getContexts).toHaveBeenCalled();
        expect(paintServiceSpy.getFrontContexts).toHaveBeenCalled();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(canvasEditorServiceSpy.getFullImageData).toHaveBeenCalledTimes(4);
        expect(canvasEditorServiceSpy.mergeImageDatas).toHaveBeenCalledTimes(2);
        expect(canvasToBase64ServiceSpy.convertToBase64).toHaveBeenCalledTimes(2);
    });
});
