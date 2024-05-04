import { PaintMode } from '@app/enums/paint-mode';
import { PaintService } from '@app/services/paint/paint.service';
import { DrawableShape } from './drawable-shape';

class DrawableShapeChild extends DrawableShape {
    getPaintMode(): PaintMode {
        return PaintMode.None;
    }
}

describe('DrawableShape', () => {
    let drawableShape: DrawableShape;

    beforeEach(async () => {
        drawableShape = new DrawableShapeChild({} as PaintService);
    });

    it('should create', () => {
        expect(drawableShape).toBeTruthy();
    });

    it('begin should set last position to undefined', () => {
        drawableShape['lastPosition'] = { x: 5, y: 10 };
        drawableShape.begin({ x: 5, y: 10 });
        expect(drawableShape['lastPosition']).toBeUndefined();
    });

    it('draw should save lastPosition and call parent method', () => {
        const parentDrawSpy = spyOn(Object.getPrototypeOf(DrawableShape).prototype, 'draw');
        const lastPosition = { x: 5, y: 10 };
        drawableShape.draw({ position: lastPosition, color: 'color', radius: 1 });
        expect(drawableShape['lastPosition']).toEqual(lastPosition);
        expect(parentDrawSpy).toHaveBeenCalled();
    });

    it('pause should set lastPosition to undefined and call parent method', () => {
        const parentPauseSpy = spyOn(Object.getPrototypeOf(DrawableShape).prototype, 'pause');
        drawableShape['lastPosition'] = { x: 5, y: 10 };
        drawableShape.pause();
        expect(drawableShape['lastPosition']).toBeUndefined();
        expect(parentPauseSpy).toHaveBeenCalled();
    });

    it('getPositionsToDraw should return an array with one position if lastPosition is undefined', () => {
        const position = { x: 5, y: 10 };
        expect(drawableShape['getPositionsToDraw'](position)).toEqual([position]);
    });

    it('getPositionsToDraw should return an array with all positions between lastPosition and position', () => {
        const lastPosition = { x: 5, y: 10 };
        const position = { x: 10, y: 20 };
        // @ts-expect-error this function is supposed to exist
        const getPixelsBetweenTwoPositionsSpy = spyOn(drawableShape, 'getPixelsBetweenTwoPositions').and.returnValue([lastPosition, position]);
        drawableShape['lastPosition'] = lastPosition;
        expect(drawableShape['getPositionsToDraw'](position)).toEqual([lastPosition, position]);
        // @ts-expect-error these are the good parameters for this test
        expect(getPixelsBetweenTwoPositionsSpy).toHaveBeenCalledWith(lastPosition, position);
    });

    it('getPixelsBetweenTwoPositions should return an array of positions between points', () => {
        const begin = { x: 5, y: 10 };
        const end = { x: 10, y: 10 };
        const positions = drawableShape['getPixelsBetweenTwoPositions'](begin, end);
        expect(positions).toEqual([
            { x: 5, y: 10 },
            { x: 6, y: 10 },
            { x: 7, y: 10 },
            { x: 8, y: 10 },
            { x: 9, y: 10 },
            { x: 10, y: 10 },
        ]);
    });

    it('getPixelsBetweenTwoPositions should return one point if begin and end are the same', () => {
        const begin = { x: 5, y: 10 };
        const end = { x: 5, y: 10 };
        const positions = drawableShape['getPixelsBetweenTwoPositions'](begin, end);
        expect(positions).toEqual([{ x: 5, y: 10 }]);
    });
});
