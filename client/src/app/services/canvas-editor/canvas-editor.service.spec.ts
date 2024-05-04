/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants';
import { CanvasAction } from '@app/interfaces/canvas-action';
import { Subject } from 'rxjs';

import { ImageArea } from '@common/enums/image-area';
import { CanvasEditorService } from './canvas-editor.service';

describe('CanvasEditorService', () => {
    let service: CanvasEditorService;
    let fakeContext: CanvasRenderingContext2D;
    let fakeSubject: Subject<CanvasAction>;

    beforeEach(() => {
        fakeSubject = new Subject();
        fakeContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        fakeSubject.subscribe({ next: (action) => action.action(fakeContext) });

        TestBed.configureTestingModule({});
        service = TestBed.inject(CanvasEditorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getContext should return a context from subject', async () => {
        const context = await service.getContext(fakeSubject, ImageArea.ORIGINAL);
        expect(context).toEqual(fakeContext);
    });

    it('getContexts should return both contexts from subject', async () => {
        const fakeLeftContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        const fakeRightContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        const subjectSpy = spyOn(fakeSubject, 'next').and.callFake((action) => {
            if (action.imageArea === ImageArea.ORIGINAL || action.imageArea === ImageArea.BOTH) {
                action.action(fakeLeftContext);
            }
            if (action.imageArea === ImageArea.MODIFIED || action.imageArea === ImageArea.BOTH) {
                action.action(fakeRightContext);
            }
        });
        const { leftContext, rightContext } = await service.getContexts(fakeSubject);
        expect(subjectSpy).toHaveBeenCalledTimes(2);
        expect(leftContext).toEqual(fakeLeftContext);
        expect(rightContext).toEqual(fakeRightContext);
    });

    it('fillPixels should fill the canvas with the given color', () => {
        const fillSpy = spyOn(fakeContext, 'fillRect');
        service.fillPixels(fakeContext, '#ff0000');
        expect(fillSpy).toHaveBeenCalledWith(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        expect(fakeContext.fillStyle).toEqual('#ff0000');
    });

    it('fillPixels should fill specified pixels when given', () => {
        const fillSpy = spyOn(fakeContext, 'fillRect');
        service.fillPixels(fakeContext, '#ff0000', [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ]);
        expect(fillSpy).toHaveBeenCalledWith(0, 0, 1, 1);
        expect(fillSpy).toHaveBeenCalledWith(1, 1, 1, 1);
        expect(fakeContext.fillStyle).toEqual('#ff0000');
    });

    it('clearCanvas should fill the canvas with white if not transparent', () => {
        const fillPixelsSpy = spyOn(service, 'fillPixels');
        service.clearCanvas(fakeContext);
        expect(fillPixelsSpy).toHaveBeenCalledWith(fakeContext, 'white');
    });

    it('clearCanvas should clear the canvas if transparent', () => {
        const clearSpy = spyOn(fakeContext, 'clearRect');
        service.clearCanvas(fakeContext, true);
        expect(clearSpy).toHaveBeenCalledWith(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
    });

    it('getFullImageData should return the image data', () => {
        const imageSpy = spyOn(fakeContext, 'getImageData').and.callFake(() => ({} as ImageData));
        service.getFullImageData(fakeContext);
        expect(imageSpy).toHaveBeenCalledWith(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
    });

    it('getColorFromImageData should return the rgba value of given pixel', () => {
        const imageData = new ImageData(1, 1);
        const color = service.getColorFromImageData(imageData.data, { x: 0, y: 0 });
        expect(color).toEqual('rgba(0, 0, 0, 0)');
    });

    it('mergeImageDatas should merge the two image data', () => {
        const imageData = new ImageData(2, 1).data;
        const imageData2 = new ImageData(2, 1).data;
        imageData[0] = 255;
        imageData2[4] = 255;
        imageData2[7] = 255;
        const resultImageData = service.mergeImageDatas(imageData, imageData2);
        expect(resultImageData[0]).toEqual(255);
        expect(resultImageData[4]).toEqual(255);
    });

    it('replaceImageData should replace the image data of one context with another', () => {
        const otherContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        const fakeImageData = new ImageData(IMAGE_WIDTH, IMAGE_HEIGHT);
        const getImageDataSpy = spyOn(fakeContext, 'getImageData').and.returnValue(fakeImageData);
        const putImageDataSpy = spyOn(otherContext, 'putImageData');
        service.replaceImageData(fakeContext, otherContext);
        expect(getImageDataSpy).toHaveBeenCalledWith(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        // @ts-expect-error the other arguments are unnecessary for this test case
        expect(putImageDataSpy).toHaveBeenCalledWith(fakeImageData, 0, 0);
    });

    it('intervertImageData should intervert the image data of two contexts', () => {
        const otherContext = CanvasTestHelper.createCanvas().getContext('2d') as CanvasRenderingContext2D;
        const fakeOriginalImageData = new ImageData(IMAGE_WIDTH, IMAGE_HEIGHT);
        const fakeModifiedImageData = new ImageData(IMAGE_WIDTH, IMAGE_HEIGHT);
        const originalGetImageDataSpy = spyOn(fakeContext, 'getImageData').and.returnValue(fakeOriginalImageData);
        const modifiedGetImageDataSpy = spyOn(otherContext, 'getImageData').and.returnValue(fakeModifiedImageData);
        const originalPutImageDataSpy = spyOn(fakeContext, 'putImageData');
        const modifiedPutImageDataSpy = spyOn(otherContext, 'putImageData');
        service.intervertImageData(fakeContext, otherContext);
        expect(originalGetImageDataSpy).toHaveBeenCalledWith(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        expect(modifiedGetImageDataSpy).toHaveBeenCalledWith(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        // @ts-expect-error the other arguments are unnecessary for this test case
        expect(originalPutImageDataSpy).toHaveBeenCalledWith(fakeModifiedImageData, 0, 0);
        // @ts-expect-error the other arguments are unnecessary for this test case
        expect(modifiedPutImageDataSpy).toHaveBeenCalledWith(fakeOriginalImageData, 0, 0);
    });

    it('replacePixels should replace the pixels of one context with another', () => {
        const fakeImageData = new ImageData(IMAGE_WIDTH, IMAGE_HEIGHT);
        const getFullImageData = spyOn(service, 'getFullImageData').and.returnValue(fakeImageData.data);
        const getColorFromImageData = spyOn(service, 'getColorFromImageData').and.returnValue('rgba(0, 0, 0, 0)');
        const fillPixelsSpy = spyOn(service, 'fillPixels');
        service.replacePixels(fakeContext, fakeContext, [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ]);
        expect(getFullImageData).toHaveBeenCalledWith(fakeContext);
        expect(getColorFromImageData).toHaveBeenCalledWith(fakeImageData.data, { x: 0, y: 0 });
        expect(getColorFromImageData).toHaveBeenCalledWith(fakeImageData.data, { x: 1, y: 1 });
        expect(fillPixelsSpy).toHaveBeenCalledWith(fakeContext, 'rgba(0, 0, 0, 0)', [{ x: 0, y: 0 }]);
        expect(fillPixelsSpy).toHaveBeenCalledWith(fakeContext, 'rgba(0, 0, 0, 0)', [{ x: 1, y: 1 }]);
    });
});
