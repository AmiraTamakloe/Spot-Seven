import { UserService } from '@app/services/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance } from 'sinon';
import { AuthenticationService } from './authentication.service';
import { GoogleAuthService } from '@app/authentication/google-jwt-auth.guard';

describe('AuthenticationService', () => {
    let service: AuthenticationService;
    let userServiceSpy: SinonStubbedInstance<UserService>;
    let jwtServiceSpy: SinonStubbedInstance<JwtService>;
    let googleAuthServiceSpy: SinonStubbedInstance<GoogleAuthService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthenticationService,
                { provide: UserService, useValue: userServiceSpy },
                { provide: JwtService, useValue: jwtServiceSpy },
                { provide: GoogleAuthService, useValue: googleAuthServiceSpy },
            ],
        }).compile();

        service = module.get<AuthenticationService>(AuthenticationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
