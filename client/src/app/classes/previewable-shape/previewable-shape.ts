import { Shape } from '@app/classes/shape/shape';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants';
import { PaintMode } from '@app/enums/paint-mode';
import { DrawOptions } from '@app/interfaces/shape';
import { Coordinate } from '@common/model/coordinate';

export abstract class PreviewableShape extends Shape {
    protected beginPosition?: Coordinate;
    private lastOptions?: DrawOptions;

    begin(position: Coordinate): void {
        this.beginPosition = position;
        super.begin(position);
    }

    draw(options: DrawOptions) {
        if (!this.beginPosition) return;
        const { position, color, isShifted } = options;
        this.lastOptions = options;
        this.parent.drawOnTemp((context) => {
            context.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        });
        this.parent.drawOnTemp((context) => {
            context.fillStyle = color;
            this.drawShape(context, position, isShifted);
        });
        super.draw(options);
    }

    end() {
        // end() can never be called without a call to draw() first
        const { position, color, isShifted } = this.lastOptions as DrawOptions;
        this.parent.drawOnFront((context) => {
            context.fillStyle = color;
            this.drawShape(context, position, isShifted);
        });
        this.parent.drawOnTemp((context) => {
            context.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        });
        return super.end();
    }

    abstract getPaintMode(): PaintMode;

    abstract drawShape(context: CanvasRenderingContext2D, position: Coordinate, isShifted?: boolean): void;
}
