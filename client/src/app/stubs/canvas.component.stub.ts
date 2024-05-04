import { Component, Input } from '@angular/core';
import { CanvasAction } from '@app/interfaces/canvas-action';
import { ImageArea } from '@common/enums/image-area';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-canvas',
    template: '',
})
export class CanvasStubComponent {
    @Input() imageArea: ImageArea = ImageArea.BOTH;
    @Input() actionObservable!: Observable<CanvasAction>;
    @Input() clearOnCreate: boolean = false;
}
