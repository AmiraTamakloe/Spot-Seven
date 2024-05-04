import { ReplayService } from '@app/services/replay/replay.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { ReplayInterceptor } from './replay.interceptor';

describe('ReplayInterceptor', () => {
    let interceptor: ReplayInterceptor;
    let replayServiceSpy: SinonStubbedInstance<ReplayService>;

    beforeEach(async () => {
        replayServiceSpy = createStubInstance(ReplayService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [ReplayInterceptor, { provide: ReplayService, useValue: replayServiceSpy }],
        }).compile();

        interceptor = module.get<ReplayInterceptor>(ReplayInterceptor);
    });

    it('should be defined', () => {
        expect(interceptor).toBeDefined();
    });
});
