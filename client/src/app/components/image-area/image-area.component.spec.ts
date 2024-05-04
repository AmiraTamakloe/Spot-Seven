// Used to spy on the private attributes
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants';
import { ImageUploadService } from '@app/services/image-upload/image-upload.service';
import { ImageService } from '@app/services/image/image.service';
import { LoadImageButtonStubComponent } from '@app/stubs/load-image-button.component.stub';

import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';
import { CanvasStubComponent } from '@app/stubs/canvas.component.stub';
import { ImageArea } from '@common/enums/image-area';
import { ImageAreaComponent } from './image-area.component';
import SpyObj = jasmine.SpyObj;

describe('ImageAreaComponent', () => {
    const testSameImage: HTMLImageElement = document.createElement('img');
    const testSpecificAreaImage: HTMLImageElement = document.createElement('img');
    let imageServiceSpy: SpyObj<ImageService>;
    let imageUploadServiceSpy: SpyObj<ImageUploadService>;
    let component: ImageAreaComponent;
    let fixture: ComponentFixture<ImageAreaComponent>;

    beforeEach(async () => {
        testSameImage.src = 'test_same_image.png';
        testSpecificAreaImage.src = 'test_specific_area_image.png';

        imageServiceSpy = jasmine.createSpyObj('ImageService', ['clearCanvas', 'setImageAsBackground']);

        imageUploadServiceSpy = jasmine.createSpyObj('ImageUploadService', ['']);

        await TestBed.configureTestingModule({
            declarations: [ImageAreaComponent, LoadImageButtonStubComponent, CanvasStubComponent],
            providers: [
                { provide: ImageService, useValue: imageServiceSpy },
                { provide: ImageUploadService, useValue: imageUploadServiceSpy },
            ],
            imports: [...getTranslocoTestingModules()],
        }).compileComponents();

        fixture = TestBed.createComponent(ImageAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('width and height should return the correct values', () => {
        expect(component.width).toEqual(IMAGE_WIDTH);
        expect(component.height).toEqual(IMAGE_HEIGHT);
    });

    it('resetBackground should call clear canvas with the correct ImageArea', () => {
        const testImageArea = ImageArea.ORIGINAL;
        component.imageArea = testImageArea;
        component.resetBackground();
        expect(imageServiceSpy.clearCanvas).toHaveBeenCalledWith(testImageArea);
    });
});
