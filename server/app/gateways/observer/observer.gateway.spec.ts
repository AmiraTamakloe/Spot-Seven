import { SocketAuthGuard } from '@app/authentication/ws-jwt-auth.guard';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { UserService } from '@app/services/user/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ObserverGateway } from './observer.gateway';

describe('ObserverGateway', () => {
    let gateway: ObserverGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ObserverGateway,
                { provide: GameManagerService, useValue: {} },
                { provide: SocketAuthGuard, useValue: {} },
                { provide: UserService, useValue: {} },
            ],
        }).compile();

        gateway = module.get<ObserverGateway>(ObserverGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
