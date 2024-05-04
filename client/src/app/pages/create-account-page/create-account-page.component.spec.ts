import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder, FormGroup } from '@angular/forms';
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';
import { AccountService } from '@app/services/account/account.service';
import { CreateAccountPageComponent } from './create-account-page.component';
import SpyObj = jasmine.SpyObj;

describe('CreateAccountPageComponent', () => {
    let component: CreateAccountPageComponent;
    let fixture: ComponentFixture<CreateAccountPageComponent>;
    let formBuilderSpy: SpyObj<FormBuilder>;
    let accountServiceSpy: SpyObj<AccountService>;
    beforeEach(async () => {
        accountServiceSpy = jasmine.createSpyObj('AccountService', ['registerAccount']);
        formBuilderSpy = jasmine.createSpyObj('FormBuilder', ['group']);
        accountServiceSpy.usernameAlreadyInUseSubject = jasmine.createSpyObj('usernameAlreadyInUseSubject', ['subscribe']);

        // eslint-disable-next-line deprecation/deprecation
        formBuilderSpy.group.and.returnValue(new FormGroup({}));
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, HttpClientTestingModule, ...getTranslocoTestingModules()],
            providers: [
                { provide: FormBuilder, useValue: formBuilderSpy },
                { provide: AccountService, useValue: accountServiceSpy },
            ],
            declarations: [CreateAccountPageComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(CreateAccountPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    // FIXME: Logic changed
    // it('should execute submittion logic when form is valid', () => {
    //     const registerAccountSpy = spyOn(component['accountService'], 'registerAccount');
    //     const userInfo = { username: 'username', email: 'test@gmail.com', password: 'Password1000', passwordConfirmation: 'Password1000' };
    //     component['createAccountForm'].setValue(userInfo);
    //     fixture.detectChanges();

    //     component.onSubmit();

    //     expect(registerAccountSpy).toHaveBeenCalled();
    // });
});
