import { TestBed } from '@angular/core/testing';
import { StatisticService } from './statistic.service';
import { AccountService } from '@app/services/account/account.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('StatisticService', () => {
    let service: StatisticService;
    let httpMock: HttpTestingController;
    let accountServiceSpy: jasmine.SpyObj<AccountService>;

    beforeEach(() => {
        accountServiceSpy = jasmine.createSpyObj('AccountService', ['getUser']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: AccountService, useValue: accountServiceSpy }],
        });
        httpMock = TestBed.inject(HttpTestingController);
        service = TestBed.inject(StatisticService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
