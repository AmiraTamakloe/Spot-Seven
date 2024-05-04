import { Shape } from '@app/classes/shape/shape';
import { DrawOptions } from '@app/interfaces/shape';
import { Coordinate } from '@common/model/coordinate';

export abstract class DrawableShape extends Shape {
    protected lastPosition?: Coordinate;

    begin(position: Coordinate) {
        this.lastPosition = undefined;
        super.begin(position);
    }

    draw(options: DrawOptions) {
        this.lastPosition = options.position;
        super.draw(options);
    }

    pause() {
        this.lastPosition = undefined;
        super.pause();
    }

    protected getPositionsToDraw(position: Coordinate): Coordinate[] {
        return this.lastPosition === undefined ? [position] : this.getPixelsBetweenTwoPositions(this.lastPosition, position);
    }

    private getPixelsBetweenTwoPositions(begin: Coordinate, end: Coordinate): Coordinate[] {
        const directionVector: Coordinate = { x: end.x - begin.x, y: end.y - begin.y };
        const distance = Math.sqrt(Math.pow(directionVector.x, 2) + Math.pow(directionVector.y, 2));
        if (distance === 0) return [begin];
        const unitVector: Coordinate = { x: directionVector.x / distance, y: directionVector.y / distance };
        const positions: Coordinate[] = [];
        for (let index = 0; index <= distance; index++) {
            positions.push({
                x: begin.x + index * unitVector.x,
                y: begin.y + index * unitVector.y,
            });
        }
        return positions;
    }
}
