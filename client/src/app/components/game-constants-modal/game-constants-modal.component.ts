import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MAX_GAME_CONST, MIN_GAME_CONST } from '@app/constants';

// Inspired by https://stackoverflow.com/a/43065100
@Component({
    selector: 'app-game-constants-modal',
    templateUrl: './game-constants-modal.component.html',
    styleUrls: ['./game-constants-modal.component.scss'],
})
export class GameConstantsModalComponent {
    gameConstantsFormControl = new FormControl<number>(0, [
        Validators.required,
        Validators.min(MIN_GAME_CONST),
        Validators.max(MAX_GAME_CONST),
        Validators.pattern(/^[0-9]*$/),
    ]);
    constructor(
        public modal: MatDialogRef<GameConstantsModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { constantMessage: string; value?: number },
    ) {
        if (data.value) {
            this.gameConstantsFormControl.setValue(data.value);
        }
    }

    getValue() {
        return this.gameConstantsFormControl.value;
    }
}
