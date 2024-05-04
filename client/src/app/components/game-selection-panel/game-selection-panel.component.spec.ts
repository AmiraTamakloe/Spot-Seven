import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameSelectionService } from '@app/services/game-selection/game-selection.service';
import { ButtonStubComponent } from '@app/stubs/button.component.stub';
import { GameSheetStubComponent } from '@app/stubs/game-sheet.component.stub';
import { ExistingGame } from '@common/model/game';
import { GameSelectionPanelComponent } from './game-selection-panel.component';
import SpyObj = jasmine.SpyObj;
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';

describe('GameSelectionPanelComponent', () => {
    let component: GameSelectionPanelComponent;
    let fixture: ComponentFixture<GameSelectionPanelComponent>;
    let gameSelectionServiceSpy: SpyObj<GameSelectionService>;
    beforeEach(async () => {
        gameSelectionServiceSpy = jasmine.createSpyObj('GameSelectionService', ['fetchGames', 'isFirstPage', 'isLastPage']);
        await TestBed.configureTestingModule({
            declarations: [GameSelectionPanelComponent, ButtonStubComponent, GameSheetStubComponent],
            providers: [{ provide: GameSelectionService, useValue: gameSelectionServiceSpy }],
            imports: [...getTranslocoTestingModules()],
        }).compileComponents();

        gameSelectionServiceSpy.gamesLoaded = true;
        gameSelectionServiceSpy.gamesToRender = [
            { name: 'game1', _id: 'id1' } as ExistingGame,
            { name: 'game2', _id: 'id2' } as ExistingGame,
            { name: 'game3', _id: 'id3' } as ExistingGame,
        ];

        fixture = TestBed.createComponent(GameSelectionPanelComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('id should return the id of the game', () => {
        fixture.detectChanges();
        const game = { _id: 'id' } as ExistingGame;
        expect(component.id(0, game)).toEqual('id');
    });
});
