import { AbstractControl, ValidationErrors } from '@angular/forms';

export const passwordMatchValidator = (groupControl: AbstractControl): ValidationErrors | null => {
    const password: string = groupControl.get('password')?.value;
    const passwordConfirmation: string = groupControl.get('passwordConfirmation')?.value;

    if (!password && !passwordConfirmation) {
        return null;
    }

    return password === passwordConfirmation ? null : { notSame: true };
};

export const passwordValidator = (control: AbstractControl): ValidationErrors | null => {
    const password: string = !!control.value ? control.value : '';
    const isValidPassword: boolean = /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

    return isValidPassword ? null : { invalidPassword: true };
};
