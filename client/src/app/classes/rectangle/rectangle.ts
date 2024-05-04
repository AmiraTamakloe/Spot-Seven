import { PreviewableShape } from '@app/classes/previewable-shape/previewable-shape';
import { PaintMode } from '@app/enums/paint-mode';
import { Coordinate } from '@common/model/coordinate';

export class Rectangle extends PreviewableShape {
    drawShape(context: CanvasRenderingContext2D, position: Coordinate, isShifted?: boolean | undefined): void {
        if (!this.beginPosition) return;
        const beginPosition = this.beginPosition;
        let beginX = Math.min(position.x, beginPosition.x);
        let beginY = Math.min(position.y, beginPosition.y);
        const width = Math.abs(position.x - beginPosition.x);
        const height = Math.abs(position.y - beginPosition.y);
        if (isShifted) {
            const side = Math.min(width, height);
            beginX = Math.max(beginX, beginPosition.x - side);
            beginY = Math.max(beginY, beginPosition.y - side);
            context.fillRect(beginX, beginY, side, side);
        } else {
            context.fillRect(beginX, beginY, width, height);
        }
    }

    getPaintMode(): PaintMode {
        return PaintMode.Rectangle;
    }
}
