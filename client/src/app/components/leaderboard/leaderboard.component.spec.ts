/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDividerStub } from '@app/stubs/mat-divider.component.stub';
import { Difficulty } from '@common/model/difficulty';
import { ExistingGame } from '@common/model/game';

import { LeaderboardComponent } from './leaderboard.component';
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';

describe('LeaderboardComponent', () => {
    let component: LeaderboardComponent;
    let fixture: ComponentFixture<LeaderboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LeaderboardComponent, MatDividerStub],
            imports: [...getTranslocoTestingModules()],
        }).compileComponents();

        fixture = TestBed.createComponent(LeaderboardComponent);
        component = fixture.componentInstance;
        const game: ExistingGame = {
            _id: 'string',
            name: 'Game X',
            difficulty: Difficulty.Easy,
            differencesCount: 5,
            originalImageFilename: 'string',
            modifiedImageFilename: 'string',
            soloHighScores: [
                {
                    playerName: 'Jim',
                    time: 1,
                },
                {
                    playerName: 'James',
                    time: 7,
                },
                {
                    playerName: 'Bond',
                    time: 7,
                },
            ],
            duelHighScores: [
                {
                    playerName: 'Jim',
                    time: 1,
                },
                {
                    playerName: 'James',
                    time: 7,
                },
                {
                    playerName: 'Bond',
                    time: 7,
                },
            ],
        };

        component.game = game;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('format should convert seconds to string', () => {
        expect(component.format(123)).toEqual('02:03');
    });
});
