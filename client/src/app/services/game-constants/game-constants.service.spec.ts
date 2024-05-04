import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GameConstantsModalComponent } from '@app/components/game-constants-modal/game-constants-modal.component';
import { Constants } from '@app/interfaces/game-constants';
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';
import { CommunicationService } from '@app/services/communication/communication.service';
import { ModalService } from '@app/services/modal/modal.service';
import { GameConstants } from '@common/game-constants';
import { defaultGameConstants } from '@common/game-default.constants';
import { of } from 'rxjs';
import { GameConstantsService } from './game-constants.service';

describe('GameConstantsService', () => {
    let service: GameConstantsService;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    let modalServiceSpy: jasmine.SpyObj<ModalService>;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['updateConstant', 'getAllConstants', 'resetAllConstants']);
        communicationServiceSpy.getAllConstants.and.callFake(() => {
            return of(defaultGameConstants);
        });

        modalServiceSpy = jasmine.createSpyObj('ModalService', ['createConfirmModal']);
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'close']);

        TestBed.configureTestingModule({
            providers: [
                GameConstantsService,
                {
                    provide: CommunicationService,
                    useValue: communicationServiceSpy,
                },
                {
                    provide: MatDialog,
                    useValue: matDialogSpy,
                },
                {
                    provide: ModalService,
                    useValue: modalServiceSpy,
                },
            ],
            imports: [...getTranslocoTestingModules()],
        });

        service = TestBed.inject(GameConstantsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('updateConstant should call updateConstant method of CommunicationService', () => {
        const newValue = 120;
        const constantDialogRefSpy: jasmine.SpyObj<MatDialogRef<GameConstantsModalComponent>> = jasmine.createSpyObj('MatDialogRef', [
            'close',
            'afterClosed',
        ]);

        const constant: Constants = {
            constantType: 'initialTime',
            value: 120,
        };

        modalServiceSpy.createConfirmModal.and.resolveTo(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        communicationServiceSpy.updateConstant.and.returnValue(of(constant.constantType as any));
        constantDialogRefSpy.afterClosed.and.callFake(() => {
            return of(constant.value);
        });
        matDialogSpy.open.and.returnValue(constantDialogRefSpy);
        const constantType: Constants['constantType'] = 'initialTime';

        service.updateConstant(constantType);

        expect(communicationServiceSpy.updateConstant).toHaveBeenCalledWith(constantType, newValue);
    });

    it('getAllConstant should call getAllConstant method of CommunicationService', () => {
        service.getAllConstants();

        expect(communicationServiceSpy.getAllConstants).toHaveBeenCalled();
    });

    it('resetAllConstants should call resetAllConstants method of CommunicationService', async () => {
        modalServiceSpy.createConfirmModal.and.resolveTo(true);
        communicationServiceSpy.resetAllConstants.and.returnValue(of(defaultGameConstants));

        await service.resetAllConstants();

        expect(communicationServiceSpy.resetAllConstants).toHaveBeenCalled();
        expect(service.constants).toEqual(defaultGameConstants);
    });

    it('getAllConstants should get all constants from the communication service', () => {
        const mockConstants: GameConstants = {
            initialTime: 60,
            hintPenalty: 10,
            differenceFoundBonus: 100,
        };

        communicationServiceSpy.getAllConstants.and.callFake(() => {
            return of(mockConstants);
        });

        service.getAllConstants();

        expect(communicationServiceSpy.getAllConstants).toHaveBeenCalled();
        expect(service.constants).toEqual(mockConstants);
    });

    it('updateConstant should update constant when confirmed', () => {
        const constantDialogRefSpy: jasmine.SpyObj<MatDialogRef<GameConstantsModalComponent>> = jasmine.createSpyObj('MatDialogRef', [
            'close',
            'afterClosed',
        ]);

        const constant: Constants = {
            constantType: 'initialTime',
            value: 120,
        };

        modalServiceSpy.createConfirmModal.and.resolveTo(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        communicationServiceSpy.updateConstant.and.returnValue(of(constant.constantType as any));
        constantDialogRefSpy.afterClosed.and.callFake(() => {
            return of(constant.value);
        });
        matDialogSpy.open.and.returnValue(constantDialogRefSpy);

        service.updateConstant(constant.constantType);

        expect(communicationServiceSpy.updateConstant).toHaveBeenCalledWith(constant.constantType, constant.value);
    });
});
