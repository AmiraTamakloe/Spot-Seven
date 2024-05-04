import { Injectable } from '@angular/core';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants';
import { CanvasAction } from '@app/interfaces/canvas-action';
import { CanvasEditorService } from '@app/services/canvas-editor/canvas-editor.service';
import { CanvasToBase64Service } from '@app/services/canvas-to-base64/canvas-to-base64.service';
import { PaintService } from '@app/services/paint/paint.service';
import { ImageArea } from '@common/enums/image-area';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    private actionImageSubject = new Subject<CanvasAction>();

    // Observable must be defined after subject
    // eslint-disable-next-line @typescript-eslint/member-ordering
    actionImageObservable = this.actionImageSubject.asObservable();

    constructor(
        private canvasEditorService: CanvasEditorService,
        private paintService: PaintService,
        private canvasToBase64Service: CanvasToBase64Service,
    ) {}

    get width(): number {
        return IMAGE_WIDTH;
    }

    get height(): number {
        return IMAGE_HEIGHT;
    }

    setImageAsBackground(image: HTMLImageElement, imageArea: ImageArea) {
        this.actionImageSubject.next({
            imageArea,
            action: (context) => {
                context.drawImage(image, 0, 0);
            },
        });
    }

    clearCanvas(imageArea: ImageArea) {
        this.actionImageSubject.next({
            imageArea,
            action: (context) => {
                this.canvasEditorService.clearCanvas(context);
            },
        });
    }

    async getImagesAsBase64(): Promise<{ leftImage: string; rightImage: string }> {
        const { leftContext: leftBackContext, rightContext: rightBackContext } = await this.canvasEditorService.getContexts(this.actionImageSubject);
        const { leftContext: leftFrontContext, rightContext: rightFrontContext } = await this.paintService.getFrontContexts();
        const leftImageData = this.canvasEditorService.mergeImageDatas(
            this.canvasEditorService.getFullImageData(leftBackContext),
            this.canvasEditorService.getFullImageData(leftFrontContext),
        );
        const rightImageData = this.canvasEditorService.mergeImageDatas(
            this.canvasEditorService.getFullImageData(rightBackContext),
            this.canvasEditorService.getFullImageData(rightFrontContext),
        );
        return {
            leftImage: this.canvasToBase64Service.convertToBase64(leftImageData),
            rightImage: this.canvasToBase64Service.convertToBase64(rightImageData),
        };
    }
}
