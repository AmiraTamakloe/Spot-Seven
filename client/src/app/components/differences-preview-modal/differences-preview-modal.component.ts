import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAX_GAME_NAME_LENGTH, MIN_GAME_NAME_LENGTH } from '@app/constants';
import { ImageCreationValidatorService } from '@app/services/image-creation-validator/image-creation-validator.service';
import { noWhiteSpaceValidator } from '@app/validators/no-whitespace/no-white-space';
import { TemporaryGameInfo } from '@common/model/temporary-game-info';

export interface DifferencesPreviewModalData {
    imageInfo: TemporaryGameInfo;
}

@Component({
    selector: 'app-differences-preview-modal',
    templateUrl: './differences-preview-modal.component.html',
    styleUrls: ['./differences-preview-modal.component.scss'],
})
export class DifferencesPreviewModalComponent implements AfterViewInit {
    @ViewChild('imageCanvas', { static: false }) private canvas!: ElementRef<HTMLCanvasElement>;
    gameNameFormControl = new FormControl('', [
        Validators.required,
        Validators.minLength(MIN_GAME_NAME_LENGTH),
        Validators.maxLength(MAX_GAME_NAME_LENGTH),
        noWhiteSpaceValidator,
    ]);

    constructor(
        public modalRef: MatDialogRef<DifferencesPreviewModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DifferencesPreviewModalData,
        private imageCreationValidationService: ImageCreationValidatorService,
    ) {}

    get width() {
        return this.imageCreationValidationService.width;
    }

    get heigth() {
        return this.imageCreationValidationService.height;
    }

    ngAfterViewInit(): void {
        if (this.data.imageInfo) {
            this.imageCreationValidationService.createImagePreview(this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D);
        }
    }

    handleCloseClick() {
        this.modalRef.close();
    }

    handleCreateGameClick() {
        this.imageCreationValidationService.createGame(this.gameNameFormControl.value as string);
        this.modalRef.close();
    }
}
