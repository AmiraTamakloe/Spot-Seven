import { FormControl } from '@angular/forms';
import { noWhiteSpaceValidator } from '@app/validators/no-whitespace/no-white-space';

describe('noWhiteSpaceValidator', () => {
    it('should return an error if the input contains only whitespace', () => {
        const control = new FormControl('   ');
        const result = noWhiteSpaceValidator(control);
        expect(result).toEqual({ emptyName: { value: '   ' } });
    });
    it('should return null if the input contains non-whitespace characters', () => {
        const control = new FormControl('John Doe');
        const result = noWhiteSpaceValidator(control);
        expect(result).toBeNull();
    });
});
