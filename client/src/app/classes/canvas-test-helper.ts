import { Injectable } from '@angular/core';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants';
import { CanvasAction } from '@app/interfaces/canvas-action';
import { ImageArea } from '@common/enums/image-area';
import { Observer } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CanvasTestHelper {
    static createCanvas(width: number = IMAGE_WIDTH, height: number = IMAGE_HEIGHT): HTMLCanvasElement {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    static createCanvasObserver(context: CanvasRenderingContext2D, myImageArea: ImageArea): Partial<Observer<CanvasAction>> {
        return {
            next: ({ imageArea, action }) => {
                if (imageArea === myImageArea || imageArea === ImageArea.BOTH) action(context);
            },
        };
    }
}
