import { AccessAuthGuard } from '@app/authentication/access.guard';
import { ReplayService } from '@app/services/replay/replay.service';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { ReplayController } from './replay.controller';

describe('ReplayController', () => {
    let controller: ReplayController;
    let replayService: SinonStubbedInstance<ReplayService>;
    let jwtService: SinonStubbedInstance<JwtService>;
    let accessAuthGuard: SinonStubbedInstance<AccessAuthGuard>;

    beforeEach(async () => {
        replayService = createStubInstance(ReplayService);
        jwtService = createStubInstance(JwtService);
        accessAuthGuard = createStubInstance(AccessAuthGuard);

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReplayController],
            providers: [
                { provide: ReplayService, useValue: replayService },
                { provide: JwtService, useValue: jwtService },
                { provide: AccessAuthGuard, useValue: accessAuthGuard },
            ],
        })
            .overrideGuard(AccessAuthGuard)
            .useValue(accessAuthGuard)
            .compile();

        controller = module.get<ReplayController>(ReplayController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
