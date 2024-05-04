import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ButtonStubComponent } from '@app/stubs/button.component.stub';
import { ErrorModalComponent } from './error-modal.component';
import SpyObj = jasmine.SpyObj;
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AccountService } from '@app/services/account/account.service';
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';

describe('ErrorModalComponent', () => {
    let component: ErrorModalComponent;
    let fixture: ComponentFixture<ErrorModalComponent>;
    let modalRefSpy: SpyObj<MatDialogRef<ErrorModalComponent>>;
    let accountServiceSpy: SpyObj<AccountService>;

    beforeEach(async () => {
        modalRefSpy = jasmine.createSpyObj('MatDialogRef<ErrorModalComponent>', ['open', 'close']);
        accountServiceSpy = jasmine.createSpyObj('AccountService', ['logOut']);
        await TestBed.configureTestingModule({
            declarations: [ErrorModalComponent, ButtonStubComponent],
            providers: [
                { provide: MatDialogRef<ErrorModalComponent>, useValue: modalRefSpy },
                { provide: AccountService, useValue: accountServiceSpy },
            ],
            imports: [
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([{ path: 'home', component: MainPageComponent }]),
                ...getTranslocoTestingModules(),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ErrorModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('close should close the modal', () => {
        component.close();
        expect(modalRefSpy.close).toHaveBeenCalled();
    });
});
