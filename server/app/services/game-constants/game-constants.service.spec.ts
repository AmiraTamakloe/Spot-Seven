/* eslint-disable @typescript-eslint/no-magic-numbers */
import { GameConstantEntity } from '@app/model/database/game-constant.entity';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { defaultGameConstants } from '@common/game-default.constants';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Repository } from 'typeorm';

describe('GameConstantsService', () => {
    const NUMBER_OF_CONSTANTS = Object.keys(defaultGameConstants).length;

    let service: GameConstantsService;
    let constantRepoMock: SinonStubbedInstance<Repository<GameConstantEntity>>;

    beforeEach(async () => {
        const mockBuilder = {
            select: jest.fn().mockReturnThis(),
            getCount: jest.fn().mockResolvedValue(1),
        };

        constantRepoMock = createStubInstance(Repository<GameConstantEntity>) as SinonStubbedInstance<Repository<GameConstantEntity>>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constantRepoMock.createQueryBuilder = jest.fn().mockReturnValue(mockBuilder) as unknown as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameConstantsService,
                {
                    provide: getRepositoryToken(GameConstantEntity),
                    useValue: constantRepoMock,
                },
            ],
        }).compile();

        service = module.get<GameConstantsService>(GameConstantsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(constantRepoMock).toBeDefined();
    });

    it('getAll() should return current game constants if they exist', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const findSpy = jest.spyOn(constantRepoMock, 'findOneByOrFail').mockResolvedValue({ value: 1 } as unknown as any);

        await service.getAll();

        expect(findSpy).toBeCalledTimes(NUMBER_OF_CONSTANTS);
    });

    it('update() should update game constant', async () => {
        const updateSpy = jest.spyOn(constantRepoMock, 'update');

        await service.update('hintPenalty', 20);

        expect(updateSpy).toHaveBeenCalledWith({ name: 'hintPenalty' }, { value: 20 });
    });

    it('resetToDefault() should reset game constants to default', async () => {
        const clearSpy = jest.spyOn(constantRepoMock, 'clear');
        const saveSpy = jest.spyOn(constantRepoMock, 'save');

        await service.resetToDefault();

        expect(clearSpy).toBeCalled();
        expect(saveSpy).toBeCalledTimes(NUMBER_OF_CONSTANTS);
    });
});
