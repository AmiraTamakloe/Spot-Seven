import { Component, Input } from '@angular/core';
import { Difficulty } from '@common/model/difficulty';
import { ExistingGame } from '@common/model/game';

@Component({
    selector: 'app-game-sheet',
    template: '',
})
export class GameSheetStubComponent {
    @Input() game: ExistingGame = {
        _id: '',
        name: '',
        difficulty: Difficulty.Easy,
        differencesCount: 0,
        originalImageFilename: '',
        modifiedImageFilename: '',
        soloHighScores: [],
        duelHighScores: [],
    };
    @Input() isConfig: boolean = false;
}
