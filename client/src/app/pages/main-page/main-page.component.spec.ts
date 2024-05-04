import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { PageBaseComponent } from '@app/pages/page-base-component/page-base-component.component';
import { AccountService } from '@app/services/account/account.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { ButtonStubComponent } from '@app/stubs/button.component.stub';
import SpyObj = jasmine.SpyObj;

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let gameStartServiceSpy: SpyObj<GameStartService>;
    let accountServiceSpy: SpyObj<AccountService>;

    beforeEach(async () => {
        gameStartServiceSpy = jasmine.createSpyObj('GameStartService', ['']);
        accountServiceSpy = jasmine.createSpyObj('AccountService', ['setAdmin']);

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule, ...getTranslocoTestingModules()],
            declarations: [MainPageComponent, ButtonStubComponent, PageBaseComponent],
            providers: [
                { provide: GameStartService, useValue: gameStartServiceSpy },
                { provide: AccountService, useValue: accountServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
