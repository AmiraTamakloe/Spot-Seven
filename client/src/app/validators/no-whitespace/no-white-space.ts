import { AbstractControl, ValidationErrors } from '@angular/forms';

export const noWhiteSpaceValidator = (control: AbstractControl): ValidationErrors | null => {
    const text = control.value;
    if (text === null) return null;
    return text.trim().length === 0 ? { emptyName: { value: control.value } } : null;
};
