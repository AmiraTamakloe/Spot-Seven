import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants';
// Disabled since we need to spy on private methods
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';

import { CanvasToBase64Service } from './canvas-to-base64.service';

describe('CanvasToBase64Service', () => {
    let ctxStub: CanvasRenderingContext2D;
    let service: CanvasToBase64Service;

    beforeEach(() => {
        ctxStub = CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        TestBed.configureTestingModule({});
        service = TestBed.inject(CanvasToBase64Service);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('convertToBase64 should call createFileHeader and createPixelArray', () => {
        const createFileHeaderSpy = spyOn<any>(service, 'createFileHeader').and.callThrough();
        const createPixelArraySpy = spyOn<any>(service, 'createPixelArray').and.callThrough();

        service.convertToBase64(ctxStub.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT).data);

        expect(createFileHeaderSpy).toHaveBeenCalled();
        expect(createPixelArraySpy).toHaveBeenCalled();
    });
});
