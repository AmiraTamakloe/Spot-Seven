import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { LoadingModalComponent } from '@app/components/loading-modal/loading-modal.component';
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { ConfigurationService } from '@app/services/configuration/configuration.service';
import { GameSelectionService } from '@app/services/game-selection/game-selection.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { ModalService } from '@app/services/modal/modal.service';
import { SocketService } from '@app/services/socket/socket.service';
import { LeaderboardStubComponent } from '@app/stubs/leaderboard.component.stub';
import { Difficulty } from '@common/model/difficulty';
import { ExistingGame, GameSheetState } from '@common/model/game';
import { of } from 'rxjs';
import { GameSheetComponent } from './game-sheet.component';
import SpyObj = jasmine.SpyObj;

describe('GameSheetComponent', () => {
    const game: ExistingGame = {
        _id: '0',
        name: 'Game 0',
        difficulty: Difficulty.Easy,
        differencesCount: 2,
        originalImageFilename: '',
        modifiedImageFilename: '',
        soloHighScores: [],
        duelHighScores: [],
    };
    let component: GameSheetComponent;
    let fixture: ComponentFixture<GameSheetComponent>;
    let modalSpy: SpyObj<MatDialog>;
    let gameSelectionServiceSpy: SpyObj<GameSelectionService>;
    let gameStartServiceSpy: SpyObj<GameStartService>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let matDialogRefSpy: SpyObj<MatDialogRef<LoadingModalComponent, any>>;
    let socketServiceSpy: SpyObj<SocketService>;
    let modalServiceSpy: SpyObj<ModalService>;
    let configurationServiceSpy: SpyObj<ConfigurationService>;

    beforeEach(async () => {
        modalSpy = jasmine.createSpyObj(MatDialog, ['open', 'close']);
        communicationServiceSpy = jasmine.createSpyObj(CommunicationService, ['deleteGame']);
        gameSelectionServiceSpy = jasmine.createSpyObj(GameSelectionService, ['deleteGame', 'setupNewGame']);
        gameStartServiceSpy = jasmine.createSpyObj(CommunicationService, ['deleteGame', 'startSoloGame', 'startMultiplayerGame']);
        matDialogRefSpy = jasmine.createSpyObj(MatDialogRef, ['open', 'close', 'afterClosed']);
        socketServiceSpy = jasmine.createSpyObj(SocketService, ['on', 'send']);
        modalServiceSpy = jasmine.createSpyObj(ModalService, ['createConfirmModal', 'deleteGame', 'createLoadingModal']);
        configurationServiceSpy = jasmine.createSpyObj(ConfigurationService, ['reinitializeScores']);

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: 'classic', component: MainPageComponent }]), ...getTranslocoTestingModules()],
            declarations: [GameSheetComponent, LeaderboardStubComponent],
            providers: [
                { provide: MatDialog, useValue: modalSpy },
                { provide: GameSelectionService, useValue: gameSelectionServiceSpy },
                { provide: GameStartService, useValue: gameStartServiceSpy },
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: MatDialogRef, useValue: matDialogRefSpy },
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: ModalService, useValue: modalServiceSpy },
                { provide: ConfigurationService, useValue: configurationServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameSheetComponent);
        component = fixture.componentInstance;
        component.game = game;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('Dificulty should change', () => {
        component.game = { ...game, difficulty: Difficulty.Difficult };
        fixture.detectChanges();
        const element: HTMLElement = fixture.nativeElement.querySelector('h3');
        expect(element.innerHTML).toContain('Difficile');
    });

    it('deleteGame should open a loading modal and make a call to the server to delete the game', async () => {
        communicationServiceSpy.deleteGame.and.returnValue(of(true));
        modalServiceSpy.createLoadingModal.and.returnValue(matDialogRefSpy);
        modalServiceSpy.createConfirmModal.and.resolveTo(true);

        await component.deleteGame();

        expect(communicationServiceSpy.deleteGame).toHaveBeenCalledWith(component.game._id);
        expect(matDialogRefSpy.close).toHaveBeenCalled();
        expect(gameSelectionServiceSpy.deleteGame).toHaveBeenCalledWith(component.game._id);
    });

    it('deleteGame should not delete the game if the user changed their mind', async () => {
        modalServiceSpy.createConfirmModal.and.resolveTo(false);
        await component.deleteGame();
        expect(communicationServiceSpy.deleteGame).not.toHaveBeenCalled();
    });

    it('reinitializeScores should ask configuration service to reset all scores', async () => {
        modalServiceSpy.createConfirmModal.and.resolveTo(true);
        await component.reinitializeScores();
        expect(configurationServiceSpy.reinitializeScores).toHaveBeenCalled();
    });

    it("updateSheetState should update the sheetState if it's for the current game", () => {
        component.sheetState = GameSheetState.Creatable;

        component['updateSheetState']({
            _id: component.game._id,
            sheetState: GameSheetState.Joinable,
        });

        expect(component.sheetState).toEqual(GameSheetState.Joinable);
    });

    it("updateSheetState should not change the sheet state if it's not for current game", () => {
        component.sheetState = GameSheetState.Creatable;

        component['updateSheetState']({
            _id: 'notYourId',
            sheetState: GameSheetState.Joinable,
        });

        expect(component.sheetState).toEqual(GameSheetState.Creatable);
    });
});
