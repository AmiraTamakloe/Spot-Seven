import { FormControl } from '@angular/forms';
import { noWhiteSpaceValidator } from '@app/validators/no-whitespace/no-white-space';

describe('userFormValidators', () => {
    it('should return an error if the input contains only whitespace', () => {
        const control = new FormControl('   ');
        const result = noWhiteSpaceValidator(control);
        expect(result).toEqual({ emptyName: { value: '   ' } });
    });
    // TODO: WRITE TESTS
});
