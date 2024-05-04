import { PreviewableShape } from '@app/classes/previewable-shape/previewable-shape';
import { PaintMode } from '@app/enums/paint-mode';
import { Coordinate } from '@common/model/coordinate';

export class Ellipse extends PreviewableShape {
    drawShape(context: CanvasRenderingContext2D, position: Coordinate, isShifted?: boolean): void {
        if (!this.beginPosition) return;

        const startAngle = 0;
        const endAngle = 2 * Math.PI;
        const rotation = 0;

        const beginPosition = this.beginPosition;

        let beginX = Math.min(position.x, beginPosition.x);
        let beginY = Math.min(position.y, beginPosition.y);

        let halfWidth = Math.abs(position.x - beginPosition.x) / 2;
        let halfHeight = Math.abs(position.y - beginPosition.y) / 2;

        if (isShifted) {
            const radius = Math.min(halfWidth, halfHeight);
            const diameter = 2 * radius;

            beginX = Math.max(beginX, beginPosition.x - diameter);
            beginY = Math.max(beginY, beginPosition.y - diameter);

            halfWidth = radius;
            halfHeight = radius;
        }

        context.beginPath();
        context.ellipse(beginX + halfWidth, beginY + halfHeight, halfWidth, halfHeight, rotation, startAngle, endAngle);
        context.fill();
    }

    getPaintMode(): PaintMode {
        return PaintMode.Ellipse;
    }
}
