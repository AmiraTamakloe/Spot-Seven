import { Component, Input } from '@angular/core';
import { ImageArea } from '@common/enums/image-area';

@Component({
    selector: 'app-load-image-button',
    template: '',
})
export class LoadImageButtonStubComponent {
    @Input() imageArea: ImageArea = ImageArea.BOTH;
}
