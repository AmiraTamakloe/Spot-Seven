import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ImageUploadService } from '@app/services/image-upload/image-upload.service';

import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';
import { ImageArea } from '@common/enums/image-area';
import { LoadImageButtonComponent } from './load-image-button.component';

import SpyObj = jasmine.SpyObj;

describe('LoadImageButtonComponent', () => {
    const imageAreas: ImageArea[] = Object.keys(ImageArea) as ImageArea[];
    const mockFile: File = new File([''], 'test_file.bmp', { type: 'image/bmp' });
    const mockChangeEvent = { target: { files: [mockFile] } };
    let fileInput: DebugElement;
    let component: LoadImageButtonComponent;
    let fixture: ComponentFixture<LoadImageButtonComponent>;
    let imageUploadServiceSpy: SpyObj<ImageUploadService>;

    beforeEach(async () => {
        imageUploadServiceSpy = jasmine.createSpyObj('ImageUploadService', ['onFileUpload']);

        await TestBed.configureTestingModule({
            declarations: [LoadImageButtonComponent],
            providers: [{ provide: ImageUploadService, useValue: imageUploadServiceSpy }],
            imports: [...getTranslocoTestingModules()],
        }).compileComponents();

        fixture = TestBed.createComponent(LoadImageButtonComponent);
        fileInput = fixture.debugElement.query(By.css('#imageInput'));
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onButtonClick should clear the file input and fire its clic event', () => {
        const imageInput = component.imageInput;
        // To access dispatchEvent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fileInputSpy = spyOn<any>(imageInput.nativeElement, 'dispatchEvent');
        Object.defineProperty(imageInput.nativeElement, 'value', { value: 'test.bmp', writable: true });

        component.onButtonClick();

        expect(imageInput.nativeElement.value).toEqual('');
        expect(fileInputSpy).toHaveBeenCalledWith(new MouseEvent('clic'));
    });

    it('should call onFileUpload with the correct parameters when the file input changes', () => {
        for (const imageArea of imageAreas) {
            component.imageArea = imageArea;
            fileInput.triggerEventHandler('change', mockChangeEvent);
            expect(imageUploadServiceSpy.onFileUpload).toHaveBeenCalledWith(mockFile, imageArea);
        }
    });

    it('should have the correct label when ImageArea.BOTH is passed as imageArea prop', () => {
        component.imageArea = ImageArea.BOTH;
        component['setButtonLabel']();
        expect(component.buttonLabel).toEqual('Charger une image en arrière plan des 2 zones');
    });

    it('should have the correct label when ImageArea.ORIGINAL is passed as imageArea prop', () => {
        component.imageArea = ImageArea.ORIGINAL;
        component['setButtonLabel']();
        expect(component.buttonLabel).toEqual('Charger une image en arrière plan');
    });

    it('should have the correct label when ImageArea.MODIFIED is passed as imageArea prop', () => {
        component.imageArea = ImageArea.MODIFIED;
        component['setButtonLabel']();
        expect(component.buttonLabel).toEqual('Charger une image en arrière plan');
    });
});
