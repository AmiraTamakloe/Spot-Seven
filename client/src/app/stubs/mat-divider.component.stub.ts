import { Component, Input } from '@angular/core';

@Component({
    // Used to mock an Angular Material component
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'mat-divider',
    template: '',
})
// Used to mock an Angular Material component
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class MatDividerStub {
    @Input() vertical: boolean = false;
}
