import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountStatisticComponent } from './account-statistic.component';
import { PageBaseComponent } from '@app/pages/page-base-component/page-base-component.component';
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';
import { StatisticService } from '@app/services/statistic/statistic.service';
import { of } from 'rxjs';

describe('AccountStatisticComponent', () => {
    let component: AccountStatisticComponent;
    let fixture: ComponentFixture<AccountStatisticComponent>;
    let statisticServiceSpy: jasmine.SpyObj<StatisticService>;

    beforeEach(async () => {
        statisticServiceSpy = jasmine.createSpyObj('StatisticService', ['getStatistics']);
        statisticServiceSpy.getStatistics.and.returnValue(of({ gamesPlayed: 1, gamesWon: 1, averageScore: 1, averageTime: '1:1' }));
        await TestBed.configureTestingModule({
            declarations: [AccountStatisticComponent, PageBaseComponent],
            imports: [...getTranslocoTestingModules()],
            providers: [{ provide: StatisticService, useValue: statisticServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(AccountStatisticComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
