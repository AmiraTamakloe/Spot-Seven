import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DifferencesPreviewModalComponent } from '@app/components/differences-preview-modal/differences-preview-modal.component';
import { ImageCreationValidatorService } from '@app/services/image-creation-validator/image-creation-validator.service';
import { PaintService } from '@app/services/paint/paint.service';
import { ButtonStubComponent } from '@app/stubs/button.component.stub';
import { ImageAreaStubComponent } from '@app/stubs/image-area.component.stub';
import { LoadImageButtonStubComponent } from '@app/stubs/load-image-button.component.stub';
import { TemporaryGameInfo } from '@common/model/temporary-game-info';
import { Subject } from 'rxjs';

import { AnimatedBackgroundStubComponent } from '@app/stubs/animated-background.component.stub';
import { PaintToolsStubComponent } from '@app/stubs/paint-tools.component.stub';
import { CreateGamePageComponent } from './create-game-page.component';
import SpyObj = jasmine.SpyObj;
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';

describe('CreateGamePageComponent', () => {
    let testTemporaryGameInfo: TemporaryGameInfo;
    let imageCreationValidationServiceSpy: SpyObj<ImageCreationValidatorService>;
    let temporaryGameInfoSubject: Subject<TemporaryGameInfo>;
    let modalSpy: SpyObj<MatDialog>;
    let component: CreateGamePageComponent;
    let fixture: ComponentFixture<CreateGamePageComponent>;
    let paintServiceSpy: SpyObj<PaintService>;

    beforeEach(async () => {
        testTemporaryGameInfo = {
            valid: true,
            differencesCount: 3,
            differencesImage: [
                { x: 90, y: 350 },
                { x: 93, y: 304 },
                { x: 200, y: 304 },
            ],
        };

        temporaryGameInfoSubject = new Subject<TemporaryGameInfo>();

        imageCreationValidationServiceSpy = jasmine.createSpyObj('ImageCreationValidatorService', ['validateImages']);

        imageCreationValidationServiceSpy.temporaryGameInfoObservable = temporaryGameInfoSubject.asObservable();

        modalSpy = jasmine.createSpyObj('MatDialog', ['open']);

        paintServiceSpy = jasmine.createSpyObj('PaintService', ['onMouseUp', 'reset', 'undo', 'redo']);

        await TestBed.configureTestingModule({
            declarations: [
                CreateGamePageComponent,
                LoadImageButtonStubComponent,
                ButtonStubComponent,
                ImageAreaStubComponent,
                AnimatedBackgroundStubComponent,
                PaintToolsStubComponent,
            ],
            providers: [
                { provide: ImageCreationValidatorService, useValue: imageCreationValidationServiceSpy },
                { provide: MatDialog, useValue: modalSpy },
                { provide: PaintService, useValue: paintServiceSpy },
            ],
            imports: [FormsModule, ...getTranslocoTestingModules()],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onMouseUp should call onMouseUp from PaintService', () => {
        component.onMouseUp();
        expect(paintServiceSpy.onMouseUp).toHaveBeenCalled();
    });

    it('onKeyDown should call undo from PaintService when ctrl + z pressed', () => {
        const fakeEvent = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });
        component.onKeyDown(fakeEvent);
        expect(paintServiceSpy.undo).toHaveBeenCalled();
    });

    it('onKeyDown should call redo from PaintService when ctrl + Z pressed', () => {
        const fakeEvent = new KeyboardEvent('keydown', { key: 'Z', ctrlKey: true });
        component.onKeyDown(fakeEvent);
        expect(paintServiceSpy.redo).toHaveBeenCalled();
    });

    it('adding a temporary game to the subscription source should open the differences preview modal', () => {
        temporaryGameInfoSubject.next(testTemporaryGameInfo);
        expect(modalSpy.open).toHaveBeenCalledWith(DifferencesPreviewModalComponent, { data: { imageInfo: testTemporaryGameInfo } });
    });

    it('removeSubscriptions should unsubscribe from the observables', () => {
        // Used to spy on the private attributes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const imageCreationSubscriptionSpy = spyOn<any>(component['imageCreationSubscription'], 'unsubscribe');
        component['removeSubscriptions']();
        expect(imageCreationSubscriptionSpy).toHaveBeenCalled();
    });

    it('handleValidation should call validateImages from ImageCreationValidatorService with the right parameters', () => {
        component.selectedRadius = 1;
        component.handleValidation();
        expect(imageCreationValidationServiceSpy.validateImages).toHaveBeenCalledWith(component.selectedRadius);
    });
});
