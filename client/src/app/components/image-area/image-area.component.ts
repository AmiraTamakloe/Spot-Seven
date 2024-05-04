import { Component, Input } from '@angular/core';
import { ImageService } from '@app/services/image/image.service';
import { PaintService } from '@app/services/paint/paint.service';
import { ImageArea } from '@common/enums/image-area';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from './../../constants';

@Component({
    selector: 'app-image-area[imageArea]',
    templateUrl: './image-area.component.html',
    styleUrls: ['./image-area.component.scss'],
})
export class ImageAreaComponent {
    @Input() imageArea: ImageArea = ImageArea.BOTH;

    constructor(public imageService: ImageService, public paintService: PaintService) {}

    get width(): number {
        return IMAGE_WIDTH;
    }

    get height(): number {
        return IMAGE_HEIGHT;
    }

    resetBackground(): void {
        this.imageService.clearCanvas(this.imageArea);
    }
}
