import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserInfo } from '@app/interfaces/user-info';
import { AccountService } from '@app/services/account/account.service';
import { noWhiteSpaceValidator } from '@app/validators/no-whitespace/no-white-space';
import { passwordMatchValidator, passwordValidator } from '@app/validators/user-form-validator/user-form-validator';

@Component({
    selector: 'app-create-account-page',
    standalone: false,
    templateUrl: './create-account-page.component.html',
    styleUrl: './create-account-page.component.scss',
})
export class CreateAccountPageComponent implements OnInit {
    usernameAlreadyInUse: boolean = false;
    avatarOptions: string[] = ['avatar1.png', 'avatar2.png', 'avatar3.png', 'avatar4.png'];
    selectedAvatar: string = 'avatar1.png';

    createAccountForm = this.formBuilder.group(
        {
            username: ['', Validators.compose([Validators.required, noWhiteSpaceValidator])],
            email: ['', Validators.compose([Validators.required, noWhiteSpaceValidator, Validators.email])],
            password: ['', Validators.compose([Validators.required, noWhiteSpaceValidator, passwordValidator])],
            passwordConfirmation: [''],
        },
        { validators: passwordMatchValidator },
    );

    constructor(private formBuilder: FormBuilder, private accountService: AccountService) {}
    ngOnInit(): void {
        this.accountService.usernameAlreadyInUseSubject.subscribe((value) => {
            this.usernameAlreadyInUse = value;
        });
        const usernameControl = this.createAccountForm.get('username');
        if (usernameControl) {
            usernameControl.valueChanges.subscribe(() => {
                this.usernameAlreadyInUse = false;
            });
        }
    }
    showPasswordError(): string {
        return 'Veuillez entrer une valeur avec au moins\n- 8 caractères\n- 1 majuscule\n- 1 nombre';
    }
    selectAvatar(avatar: string) {
        this.selectedAvatar = avatar;
    }
    onSubmit() {
        if (this.createAccountForm.valid) {
            const userInfo = this.createAccountForm.value as UserInfo;
            userInfo.avatar = this.selectedAvatar;
            this.accountService.registerAccount(userInfo);
            this.createAccountForm.reset();
        }
    }
}
