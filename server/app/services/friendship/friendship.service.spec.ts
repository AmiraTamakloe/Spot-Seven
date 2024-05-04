import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@app/model/database/user.entity';
import { Repository } from 'typeorm';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FriendshipService } from './friendship.service';
import { Friendship } from '@app/model/database/friendship.entity';
import { UserService } from '@app/services/user/user.service';
import { FriendshipGateway } from '@app/gateways/friendship/friendship.gateway';

describe('FriendshipService', () => {
    let service: FriendshipService;
    let friendshipRepoMock: SinonStubbedInstance<Repository<Friendship>>;
    let userServiceStub: SinonStubbedInstance<UserService>;
    let friendshipGatewayStub: SinonStubbedInstance<FriendshipGateway>;

    beforeEach(async () => {
        userServiceStub = createStubInstance(UserService);
        friendshipGatewayStub = createStubInstance(FriendshipGateway);
        friendshipRepoMock = createStubInstance(Repository<User>) as unknown as SinonStubbedInstance<Repository<Friendship>>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FriendshipService,
                { provide: getRepositoryToken(Friendship), useValue: friendshipRepoMock },
                { provide: UserService, useValue: userServiceStub },
                { provide: FriendshipGateway, useValue: friendshipGatewayStub },
            ],
        }).compile();

        service = module.get<FriendshipService>(FriendshipService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
