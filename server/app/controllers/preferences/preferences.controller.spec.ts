/* eslint-disable @typescript-eslint/no-magic-numbers */
import { AccessAuthGuard } from '@app/authentication/access.guard';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { PreferencesController } from './preferences.controller';

describe('PreferencesController', () => {
    let controller: PreferencesController;
    let preferencesService: SinonStubbedInstance<PreferencesService>;
    let accessAuthGuard: SinonStubbedInstance<AccessAuthGuard>;
    let authenticationService: SinonStubbedInstance<AuthenticationService>;

    beforeEach(async () => {
        preferencesService = createStubInstance(PreferencesService);

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PreferencesController],
            providers: [
                {
                    provide: PreferencesService,
                    useValue: preferencesService,
                },
                {
                    provide: AccessAuthGuard,
                    useValue: accessAuthGuard,
                },
                {
                    provide: AuthenticationService,
                    useValue: authenticationService,
                },
            ],
        }).compile();

        controller = module.get(PreferencesController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
