import { DrawableShape } from '@app/classes/drawable-shape/drawable-shape';
import { PaintMode } from '@app/enums/paint-mode';
import { DrawOptions } from '@app/interfaces/shape';

export class Pencil extends DrawableShape {
    draw(options: DrawOptions) {
        const { position, color, radius } = options;
        this.parent.drawOnFront((context) => {
            context.fillStyle = color;
            context.strokeStyle = color;
            context.lineWidth = radius * 2;
            if (this.lastPosition) {
                context.beginPath();
                context.moveTo(this.lastPosition.x, this.lastPosition.y);
                context.lineTo(position.x, position.y);
                context.stroke();
            }
            context.beginPath();
            context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
            context.fill();
        });
        super.draw(options);
    }

    getPaintMode(): PaintMode {
        return PaintMode.Pencil;
    }
}
