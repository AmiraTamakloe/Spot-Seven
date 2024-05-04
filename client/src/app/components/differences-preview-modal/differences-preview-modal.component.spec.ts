import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigurationComponent } from '@app/pages/configuration/configuration.component';
import { ImageCreationValidatorService } from '@app/services/image-creation-validator/image-creation-validator.service';
import { MatFormFieldStub } from '@app/stubs/mat-form-field.component.stub';
import { MatLabelStub } from '@app/stubs/mat-label.component.stub';

import { DifferencesPreviewModalComponent, DifferencesPreviewModalData } from './differences-preview-modal.component';
import SpyObj = jasmine.SpyObj;
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';

describe('DifferencesPreviewModalComponent', () => {
    const modalData: DifferencesPreviewModalData = {
        imageInfo: {
            valid: true,
            differencesCount: 3,
            differencesImage: [
                { x: 90, y: 350 },
                { x: 93, y: 304 },
                { x: 200, y: 304 },
            ],
        },
    };

    let modalRefSpy: SpyObj<MatDialogRef<DifferencesPreviewModalComponent>>;
    let differencesPreviewServiceSpy: SpyObj<ImageCreationValidatorService>;
    let component: DifferencesPreviewModalComponent;
    let fixture: ComponentFixture<DifferencesPreviewModalComponent>;

    beforeEach(async () => {
        modalRefSpy = jasmine.createSpyObj('MatDialogRef<DifferencesPreviewModalComponent>', ['close']);
        differencesPreviewServiceSpy = jasmine.createSpyObj('ImageCreationValidatorService', ['createImagePreview', 'createGame']);

        await TestBed.configureTestingModule({
            declarations: [DifferencesPreviewModalComponent, MatFormFieldStub, MatLabelStub],
            providers: [
                { provide: ImageCreationValidatorService, useValue: differencesPreviewServiceSpy },
                { provide: MatDialogRef<DifferencesPreviewModalComponent>, useValue: modalRefSpy },
                { provide: MAT_DIALOG_DATA, useValue: modalData },
            ],
            imports: [
                RouterTestingModule.withRoutes([{ path: 'config', component: ConfigurationComponent }]),
                ReactiveFormsModule,
                ...getTranslocoTestingModules(),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DifferencesPreviewModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('handleCloseClick should close the modal', () => {
        component.handleCloseClick();
        expect(modalRefSpy.close).toHaveBeenCalled();
    });

    it('handleCreateGameClick should create a new game and close the modal', () => {
        const testGameName = 'New Test Game';
        component.gameNameFormControl.setValue(testGameName);
        component.handleCreateGameClick();
        expect(modalRefSpy.close).toHaveBeenCalled();
        expect(differencesPreviewServiceSpy.createGame).toHaveBeenCalledWith(testGameName);
    });
});
