import { Component, Input } from '@angular/core';
import { Difficulty } from '@common/model/difficulty';
import { Game as ExistingGame } from '@common/model/game';

@Component({
    selector: 'app-leaderboard',
    template: '',
})
export class LeaderboardStubComponent {
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
}
