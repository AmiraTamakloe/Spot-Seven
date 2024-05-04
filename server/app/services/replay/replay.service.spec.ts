import { Replay } from '@app/model/database/replay.entity';
import { FileService } from '@app/services/file/file.service';
import { UserService } from '@app/services/user/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Repository } from 'typeorm';
import { ReplayService } from './replay.service';

describe('ReplayService', () => {
    let service: ReplayService;
    let userService: SinonStubbedInstance<UserService>;
    let fileService: SinonStubbedInstance<FileService>;
    let replayRepoMock: SinonStubbedInstance<Repository<Replay>>;

    beforeEach(async () => {
        userService = createStubInstance(UserService);
        fileService = createStubInstance(FileService);

        replayRepoMock = createStubInstance(Repository<Replay>) as unknown as SinonStubbedInstance<Repository<Replay>>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReplayService,
                { provide: UserService, useValue: userService },
                { provide: FileService, useValue: fileService },
                { provide: getRepositoryToken(Replay), useValue: replayRepoMock },
            ],
        }).compile();

        service = module.get<ReplayService>(ReplayService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
