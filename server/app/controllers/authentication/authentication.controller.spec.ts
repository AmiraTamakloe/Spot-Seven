import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { createStubInstance } from 'sinon';
import { UserService } from '@app/services/user/user.service';

describe('AuthenticationController', () => {
    let controller: AuthenticationController;
    let authenticationService: AuthenticationService;
    let userService: UserService;

    beforeEach(async () => {
        authenticationService = createStubInstance(AuthenticationService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthenticationController],
            providers: [
                {
                    provide: AuthenticationService,
                    useValue: authenticationService,
                },
                {
                    provide: UserService,
                    useValue: userService,
                },
            ],
        }).compile();

        controller = module.get<AuthenticationController>(AuthenticationController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
