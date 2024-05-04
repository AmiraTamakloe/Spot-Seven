// Disabled to access private attributes of the service
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { IMAGE_SIZE } from '@app/constants';
import { Buffer } from 'buffer';

import { ImageService } from '@app/services/image/image.service';
import { ImageArea } from '@common/enums/image-area';
import { ImageUploadService } from './image-upload.service';

import SpyObj = jasmine.SpyObj;

describe('ImageUploadService', () => {
    const imageAreas: ImageArea[] = Object.keys(ImageArea) as ImageArea[];

    const mockFileGood: File = new File(
        [
            Buffer.from(
                'Qk0AAAAAAAAAADYAAAAoAAAABQAAAAUAAAABABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////AAAAAAAAAAAAAP\
                //AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAAAAAAAAAP8AAAA=',
                'base64',
            ),
        ],
        'good_image.bmp',
        { type: 'image/bmp' },
    );
    const mockFileSmallSize: File = new File([''], 'test_file_smalll_size.bmp', { type: 'image/bmp' });
    const mockFileBigSize: File = new File([''], 'test_file_big_size.bmp', { type: 'image/bmp' });
    const mockFileBadFormat: File = new File([''], 'test_file_bad_format.png', { type: 'image/png' });

    const badFiles = [mockFileBadFormat, mockFileBigSize, mockFileSmallSize];

    let service: ImageUploadService;
    let imageServiceSpy: SpyObj<ImageService>;

    beforeEach(() => {
        const smallSize = 1024;
        const bigSize = IMAGE_SIZE + smallSize;

        imageServiceSpy = jasmine.createSpyObj(ImageService, ['setImageAsBackground']);

        Object.defineProperty(mockFileGood, 'size', { value: IMAGE_SIZE });
        Object.defineProperty(mockFileSmallSize, 'size', { value: smallSize });
        Object.defineProperty(mockFileBigSize, 'size', { value: bigSize });
        Object.defineProperty(mockFileBadFormat, 'size', { value: IMAGE_SIZE });

        TestBed.configureTestingModule({
            providers: [{ provide: ImageService, useValue: imageServiceSpy }, ImageUploadService],
        });
        service = TestBed.inject(ImageUploadService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onFileUpload should call imageService.setImageAsBackground', async () => {
        const fakeImage = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            addEventListener: (_: any, action: any) => {
                action();
            },
        } as HTMLImageElement;
        spyOn(window, 'Image').and.returnValue(fakeImage);
        const fakeFile = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            addEventListener: (_: any, action: any) => {
                action();
            },
        } as FileReader;
        spyOn(window, 'FileReader').and.returnValue(fakeFile);

        imageServiceSpy.setImageAsBackground.and.callFake((_, imageArea) => {
            expect(imageArea).toEqual(ImageArea.BOTH);
        });
        await service.onFileUpload(mockFileGood, ImageArea.BOTH);

        expect(imageServiceSpy.setImageAsBackground).toHaveBeenCalled();
    });

    it('onFileUpload not accept invalid files', async () => {
        for (const file of badFiles) {
            for (const imageArea of imageAreas) {
                await expectAsync(service.onFileUpload(file, imageArea)).toBeRejected();
                expect(imageServiceSpy.setImageAsBackground).not.toHaveBeenCalled();
            }
        }
    });
});
