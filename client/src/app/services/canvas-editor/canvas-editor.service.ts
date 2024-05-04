import { Injectable } from '@angular/core';
import { COLOR_COMPONENTS, IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants';
import { CanvasAction } from '@app/interfaces/canvas-action';
import { ImageArea } from '@common/enums/image-area';
import { Coordinate } from '@common/model/coordinate';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CanvasEditorService {
    async getContext(subject: Subject<CanvasAction>, imageArea: ImageArea): Promise<CanvasRenderingContext2D> {
        return new Promise((resolve) => {
            subject.next({ imageArea, action: resolve });
        });
    }

    async getContexts(subject: Subject<CanvasAction>): Promise<{ leftContext: CanvasRenderingContext2D; rightContext: CanvasRenderingContext2D }> {
        const leftContext = await this.getContext(subject, ImageArea.ORIGINAL);
        const rightContext = await this.getContext(subject, ImageArea.MODIFIED);
        return { leftContext, rightContext };
    }

    fillPixels(context: CanvasRenderingContext2D, color: string, pixels?: Coordinate[]) {
        if (pixels === undefined) {
            context.fillStyle = color;
            context.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        } else {
            pixels.forEach((coordinate) => {
                context.fillStyle = color;
                context.fillRect(coordinate.x, coordinate.y, 1, 1);
            });
        }
    }

    clearCanvas(context: CanvasRenderingContext2D, transparent: boolean = false) {
        if (transparent) {
            context.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        } else {
            this.fillPixels(context, 'white');
        }
    }

    getFullImageData(context: CanvasRenderingContext2D): Uint8ClampedArray {
        return context.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT).data;
    }

    getColorFromImageData(imageData: Uint8ClampedArray, coordinate: Coordinate): string {
        const pixelPosition = coordinate.y * IMAGE_WIDTH * COLOR_COMPONENTS + coordinate.x * COLOR_COMPONENTS;
        const [red, green, blue, alpha] = imageData.slice(pixelPosition, pixelPosition + COLOR_COMPONENTS);
        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }

    mergeImageDatas(backImageData: Uint8ClampedArray, frontImageData: Uint8ClampedArray) {
        for (let index = 0; index < backImageData.length; index += COLOR_COMPONENTS) {
            const frontAlpha = frontImageData[index + 3];
            if (frontAlpha) {
                backImageData[index] = frontImageData[index];
                backImageData[index + 1] = frontImageData[index + 1];
                backImageData[index + 2] = frontImageData[index + 2];
                backImageData[index + 3] = 255;
            }
        }
        return backImageData;
    }

    replaceImageData(originalContext: CanvasRenderingContext2D, modifiedContext: CanvasRenderingContext2D) {
        const originalImageData = originalContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        modifiedContext.putImageData(originalImageData, 0, 0);
    }

    intervertImageData(leftContext: CanvasRenderingContext2D, rightContext: CanvasRenderingContext2D) {
        const leftImageData = leftContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        const rightImageData = rightContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        leftContext.putImageData(rightImageData, 0, 0);
        rightContext.putImageData(leftImageData, 0, 0);
    }

    replacePixels(originalContext: CanvasRenderingContext2D, modifiedContext: CanvasRenderingContext2D, pixels: Coordinate[]) {
        const imageData = this.getFullImageData(originalContext);
        pixels.forEach((coordinate) => {
            const color = this.getColorFromImageData(imageData, coordinate);
            this.fillPixels(modifiedContext, color, [coordinate]);
        });
    }

    drawText(context: CanvasRenderingContext2D, textOptions: { text: string; color: string; position: Coordinate }) {
        context.fillStyle = textOptions.color;
        context.font = '20px system-ui';
        context.fillText(textOptions.text, textOptions.position.x, textOptions.position.y);
    }
}
