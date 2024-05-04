import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from '@app/model/database/user.entity';
import { Repository } from 'typeorm';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UserService', () => {
    let service: UserService;
    let userRepoMock: SinonStubbedInstance<Repository<User>>;

    beforeEach(async () => {
        userRepoMock = createStubInstance(Repository<User>) as unknown as SinonStubbedInstance<Repository<User>>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [UserService, { provide: getRepositoryToken(User), useValue: userRepoMock }],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
