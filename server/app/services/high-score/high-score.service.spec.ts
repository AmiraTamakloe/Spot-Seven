/* eslint-disable no-unused-vars */
import { DuelHighScore } from '@app/model/database/duel-highscore.entity';
import { SoloHighScore } from '@app/model/database/solo-highscore.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Repository } from 'typeorm';
import { HighScoreService } from './high-score.service';

describe('HighScoreService', () => {
    let service: HighScoreService;
    let soloHighScoreRepositoryMock: SinonStubbedInstance<Repository<SoloHighScore>>;
    let duelHighScoreRepositoryMock: SinonStubbedInstance<Repository<DuelHighScore>>;

    beforeEach(async () => {
        soloHighScoreRepositoryMock = createStubInstance(Repository<SoloHighScore>) as SinonStubbedInstance<Repository<SoloHighScore>>;
        duelHighScoreRepositoryMock = createStubInstance(Repository<DuelHighScore>) as SinonStubbedInstance<Repository<DuelHighScore>>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HighScoreService,
                {
                    provide: getRepositoryToken(SoloHighScore),
                    useValue: soloHighScoreRepositoryMock,
                },
                {
                    provide: getRepositoryToken(DuelHighScore),
                    useValue: duelHighScoreRepositoryMock,
                },
            ],
        }).compile();

        service = module.get<HighScoreService>(HighScoreService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
