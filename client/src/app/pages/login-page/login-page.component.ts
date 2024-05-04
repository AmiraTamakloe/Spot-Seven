import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TEAM_MEMBERS } from '@app/constants/initial-view-constants';
import { UserInfo } from '@app/interfaces/user-info';
import { AccountService } from '@app/services/account/account.service';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
    incorrectUsernameOrPassword: boolean = false;
    logInForm = this.formBuilder.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
    });

    constructor(private formBuilder: FormBuilder, private accountService: AccountService) {}

    ngOnInit(): void {
        this.accountService.subscribeToSocialAuthService();
        this.accountService.incorrectUsernameOrPasswordSubject.subscribe((value) => {
            this.incorrectUsernameOrPassword = value;
        });
        this.logInForm.get('username')?.valueChanges.subscribe(() => {
            this.incorrectUsernameOrPassword = false;
        });

        this.logInForm.get('password')?.valueChanges.subscribe(() => {
            this.incorrectUsernameOrPassword = false;
        });
    }

    getTeamMembers() {
        return TEAM_MEMBERS;
    }

    onSubmit() {
        if (this.logInForm.valid) {
            const userInfo = this.logInForm.value as UserInfo;
            this.accountService.logInAccount(userInfo);
            this.logInForm.reset();
        }
    }
}
