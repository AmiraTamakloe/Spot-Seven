import { Test, TestingModule } from '@nestjs/testing';
import { PreferencesService } from './preferences.service';
import { Repository } from 'typeorm';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Preferences } from '@app/model/database/preferences.entity';

describe('PreferencesService', () => {
    let service: PreferencesService;
    let preferencesRepoMock: SinonStubbedInstance<Repository<Preferences>>;

    beforeEach(async () => {
        preferencesRepoMock = createStubInstance(Repository<Preferences>) as unknown as SinonStubbedInstance<Repository<Preferences>>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [PreferencesService, { provide: getRepositoryToken(Preferences), useValue: preferencesRepoMock }],
        }).compile();

        service = module.get<PreferencesService>(PreferencesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
