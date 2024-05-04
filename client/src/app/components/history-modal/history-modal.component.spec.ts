import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GameMode } from '@common/game-mode';
import { History } from '@common/model/history';

import { ButtonStubComponent } from '@app/stubs/button.component.stub';
import { HistoryModalComponent } from './history-modal.component';

import SpyObj = jasmine.SpyObj;
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';

describe('HistoryModalComponent', () => {
    let component: HistoryModalComponent;
    let fixture: ComponentFixture<HistoryModalComponent>;
    let modalRefSpy: SpyObj<MatDialogRef<HistoryModalComponent>>;

    const history1: History = {
        gameStart: Date.now(),
        gameTime: 5,
        gameMode: GameMode.Classic,
        players: ['player'],
    };

    const history2: History = {
        gameStart: Date.now(),
        gameTime: 5,
        gameMode: GameMode.ClassicTeam,
        players: ['player', 'player'],
        isWinner: 0,
        hasAbandonned: 1,
    };

    const history3: History = {
        gameStart: Date.now(),
        gameTime: 5,
        gameMode: GameMode.TimeLimited,
        players: ['player', 'player'],
        isWinner: 0,
        hasAbandonned: 0,
    };

    const history4: History = {
        gameStart: Date.now(),
        gameTime: 5,
        gameMode: GameMode.TimeLimitedImproved,
        players: ['player'],
        isWinner: 0,
        hasAbandonned: 0,
    };

    const fakeMatDialogData = [history1, history2, history3, history4];

    beforeEach(async () => {
        modalRefSpy = jasmine.createSpyObj(MatDialogRef<HistoryModalComponent>, ['close']);

        await TestBed.configureTestingModule({
            declarations: [HistoryModalComponent, ButtonStubComponent],
            providers: [
                { provide: MatDialogRef<HistoryModalComponent>, useValue: modalRefSpy },
                { provide: MAT_DIALOG_DATA, useValue: fakeMatDialogData },
            ],
            imports: [...getTranslocoTestingModules()],
        }).compileComponents();

        fixture = TestBed.createComponent(HistoryModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close if close() is called', () => {
        component.close();
        expect(modalRefSpy.close).toHaveBeenCalled();
    });
});
