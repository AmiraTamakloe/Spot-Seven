import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DifferencesPreviewModalComponent } from '@app/components/differences-preview-modal/differences-preview-modal.component';
import { DEFAULT_RADIUS, DIFFERENCE_RADIUSES } from '@app/constants';
import { PaintMode } from '@app/enums/paint-mode';
import { ImageCreationValidatorService } from '@app/services/image-creation-validator/image-creation-validator.service';
import { ImageUploadService } from '@app/services/image-upload/image-upload.service';
import { PaintService } from '@app/services/paint/paint.service';
import { ImageArea } from '@common/enums/image-area';
import { TemporaryGameInfo } from '@common/model/temporary-game-info';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-create-game-page',
    templateUrl: './create-game-page.component.html',
    styleUrls: ['./create-game-page.component.scss'],
    providers: [ImageUploadService],
})
export class CreateGamePageComponent implements OnInit, OnDestroy {
    selectedRadius = DEFAULT_RADIUS;
    radiuses = DIFFERENCE_RADIUSES;
    areas = ImageArea;
    modes = PaintMode;

    private imageCreationSubscription = new Subscription();

    // More than 4 parameters needed
    // Disabled since we require these services to be injected
    // eslint-disable-next-line max-params
    constructor(
        private imageCreationValidationService: ImageCreationValidatorService,
        private modal: MatDialog,
        public paintService: PaintService,
        public imageUploadService: ImageUploadService,
    ) {}

    @HostListener('document:mouseup')
    onMouseUp() {
        this.paintService.onMouseUp();
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (event.ctrlKey) {
            if (event.key === 'Z') {
                this.paintService.redo();
            } else if (event.key === 'z') {
                this.paintService.undo();
            }
        }
    }

    ngOnInit(): void {
        this.linkWithServices();
        this.paintService.reset();
    }

    ngOnDestroy(): void {
        this.removeSubscriptions();
    }

    handleValidation() {
        this.imageCreationValidationService.validateImages(this.selectedRadius);
    }

    private linkWithServices() {
        const temporaryGameObserver = (temporaryGame: TemporaryGameInfo) => {
            this.modal.open(DifferencesPreviewModalComponent, {
                data: { imageInfo: temporaryGame },
            });
        };

        this.imageCreationSubscription = this.imageCreationValidationService.temporaryGameInfoObservable.subscribe(temporaryGameObserver);
    }

    private removeSubscriptions() {
        this.imageCreationSubscription.unsubscribe();
    }
}
