import { DrawableShape } from '@app/classes/drawable-shape/drawable-shape';
import { PaintMode } from '@app/enums/paint-mode';
import { DrawOptions } from '@app/interfaces/shape';

export class Eraser extends DrawableShape {
    draw(options: DrawOptions) {
        const { position, radius } = options;
        this.parent.drawOnFront((context) => {
            this.getPositionsToDraw(position).forEach((pos) => {
                const x = pos.x - radius;
                const y = pos.y - radius;
                const width = radius * 2;
                const height = radius * 2;
                context.clearRect(x, y, width, height);
            });
        });
        super.draw(options);
    }

    getPaintMode(): PaintMode {
        return PaintMode.Eraser;
    }
}
