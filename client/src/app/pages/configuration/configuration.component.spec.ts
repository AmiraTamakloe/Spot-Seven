import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { CommunicationService } from '@app/services/communication/communication.service';
import { ConfigurationService } from '@app/services/configuration/configuration.service';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { GameSelectionService } from '@app/services/game-selection/game-selection.service';
import { ModalService } from '@app/services/modal/modal.service';
import { ButtonStubComponent } from '@app/stubs/button.component.stub';
import { GameSelectionPanelStubComponent } from '@app/stubs/game-selection-panel.component.stub';
import { GameConstants } from '@common/game-constants';
import { defaultGameConstants } from '@common/game-default.constants';
import { GameMode } from '@common/game-mode';
import { of } from 'rxjs';
import { ConfigurationComponent } from './configuration.component';
import SpyObj = jasmine.SpyObj;
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';

describe('ConfigurationComponent', () => {
    let component: ConfigurationComponent;
    let fixture: ComponentFixture<ConfigurationComponent>;
    let matDialogSpy: SpyObj<MatDialog>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let modalServiceSpy: jasmine.SpyObj<ModalService>;
    let configurationServiceSpy: jasmine.SpyObj<ConfigurationService>;
    let gameSelectionServiceSpy: jasmine.SpyObj<GameSelectionService>;
    let gameConstantsServiceSpy: jasmine.SpyObj<GameConstantsService>;
    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'close']);
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', [
            'updateConstant',
            'getAllConstant',
            'resetAllConstants',
            'deleteAllGames',
            'getHistory',
            'deleteHistory',
        ]);
        modalServiceSpy = jasmine.createSpyObj(ModalService, ['createConfirmModal', 'createHistoryModal']);
        configurationServiceSpy = jasmine.createSpyObj(ConfigurationService, ['reinitializeAllScores']);
        gameSelectionServiceSpy = jasmine.createSpyObj(GameSelectionService, ['fetchGames']);
        gameConstantsServiceSpy = jasmine.createSpyObj('GameConstantsService', ['updateConstant', 'getAllConstants', 'resetAllConstants']);
        gameConstantsServiceSpy.constants = defaultGameConstants;

        await TestBed.configureTestingModule({
            declarations: [ConfigurationComponent, ButtonStubComponent, GameSelectionPanelStubComponent],
            imports: [...getTranslocoTestingModules()],
            providers: [
                {
                    provide: ConfigurationService,
                    useValue: configurationServiceSpy,
                },
                {
                    provide: ModalService,
                    useValue: modalServiceSpy,
                },
                {
                    provide: MatDialog,
                    useValue: matDialogSpy,
                },
                {
                    provide: CommunicationService,
                    useValue: communicationServiceSpy,
                },
                {
                    provide: GameSelectionService,
                    useValue: gameSelectionServiceSpy,
                },
                {
                    provide: GameConstantsService,
                    useValue: gameConstantsServiceSpy,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfigurationComponent);

        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('reinitializeAllScores should confirm then reset all scores', async () => {
        modalServiceSpy.createConfirmModal.and.resolveTo(true);
        await component.reinitializeAllScores();
        expect(configurationServiceSpy.reinitializeAllScores).toHaveBeenCalled();
        expect(modalServiceSpy.createConfirmModal).toHaveBeenCalled();
    });

    it('should delete all games after confirmation', async () => {
        modalServiceSpy.createConfirmModal.and.resolveTo(true);
        communicationServiceSpy.deleteAllGames.and.returnValue(of({}));
        await component.deleteAll();
        expect(communicationServiceSpy.deleteAllGames).toHaveBeenCalled();
        expect(modalServiceSpy.createConfirmModal).toHaveBeenCalled();
    });

    it('should return an array of constants as key-value pairs', () => {
        gameConstantsServiceSpy.constants = {
            initialTime: defaultGameConstants.initialTime,
            hintPenalty: defaultGameConstants.hintPenalty,
            differenceFoundBonus: defaultGameConstants.differenceFoundBonus,
        } as GameConstants;

        const expectedOutput = [
            { key: 'initialTime', value: defaultGameConstants.initialTime },
            { key: 'hintPenalty', value: defaultGameConstants.hintPenalty },
            { key: 'differenceFoundBonus', value: defaultGameConstants.differenceFoundBonus },
        ];
        const result = component.getConstantsInDisplayFormat();
        expect(result).toEqual(jasmine.arrayWithExactContents(expectedOutput));
    });
    it('displayHistory should display the game history', () => {
        communicationServiceSpy.getHistory.and.returnValue(
            of([
                {
                    gameStart: Date.now(),
                    gameTime: 5,
                    gameMode: GameMode.Classic,
                    players: ['player'],
                },
                {
                    gameStart: Date.now(),
                    gameTime: 5,
                    gameMode: GameMode.ClassicTeam,
                    players: ['player', 'player'],
                    isWinner: 0,
                    hasAbandonned: 1,
                },
                {
                    gameStart: Date.now(),
                    gameTime: 5,
                    gameMode: GameMode.TimeLimited,
                    players: ['player', 'player'],
                    isWinner: 0,
                    hasAbandonned: 0,
                },
                {
                    gameStart: Date.now(),
                    gameTime: 5,
                    gameMode: GameMode.TimeLimitedImproved,
                    players: ['player'],
                    isWinner: 0,
                    hasAbandonned: 0,
                },
            ]),
        );
        component.displayHistory();
        expect(modalServiceSpy.createHistoryModal).toHaveBeenCalled();
    });

    it('deleteHistory should ask for confirmation then delete history', async () => {
        modalServiceSpy.createConfirmModal.and.resolveTo(true);
        communicationServiceSpy.deleteHistory.and.returnValue(of());
        await component.deleteHistory();
        expect(modalServiceSpy.createConfirmModal).toHaveBeenCalled();
    });
});
