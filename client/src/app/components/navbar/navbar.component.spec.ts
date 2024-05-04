import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { MatMenuModule } from '@angular/material/menu';
import { AccountService } from '@app/services/account/account.service';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
    let component: NavbarComponent;
    let fixture: ComponentFixture<NavbarComponent>;
    let accountServiceSpy: jasmine.SpyObj<AccountService>;

    beforeEach(async () => {
        accountServiceSpy = jasmine.createSpyObj('AccountService', ['isLoggedIn']);

        await TestBed.configureTestingModule({
            declarations: [NavbarComponent],
            imports: [MatMenuModule, HttpClientModule],
            providers: [{ provide: AccountService, useValue: accountServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(NavbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
