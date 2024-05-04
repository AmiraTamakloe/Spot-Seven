import { Component } from '@angular/core';
import { PaintMode } from '@app/enums/paint-mode';
import { PaintService } from '@app/services/paint/paint.service';
@Component({
    selector: 'app-paint-tools',
    templateUrl: './paint-tools.component.html',
    styleUrls: ['./paint-tools.component.scss'],
})
export class PaintToolsComponent {
    modes = PaintMode;
    constructor(public paintService: PaintService) {}
}
