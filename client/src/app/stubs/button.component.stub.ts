import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-button',
    template: '',
})
export class ButtonStubComponent {
    @Input() color: string = 'white';
    @Input() type: string = 'button';
    @Input() isDisabled: boolean = false;
    @Input() icon: string = '';
    @Input() link: string = '';
}
