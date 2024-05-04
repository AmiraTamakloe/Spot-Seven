import { PaintMode } from '@app/enums/paint-mode';
import { PaintService } from '@app/services/paint/paint.service';
import { Shape } from './shape';

class ShapeChild extends Shape {
    getPaintMode(): PaintMode {
        return PaintMode.None;
    }
}

describe('Shape', () => {
    let shape: Shape;

    beforeEach(async () => {
        shape = new ShapeChild({} as PaintService);
    });

    it('should be created', () => {
        expect(shape).toBeTruthy();
    });

    it('begin should save position to history', () => {
        const beginSpy = spyOn(shape, 'begin').and.callThrough();
        const position = { x: 5, y: 10 };
        shape.begin(position);
        expect(shape['history'].length).toEqual(1);
        shape['history'][0](shape);
        expect(beginSpy).toHaveBeenCalledTimes(2);
    });

    it('draw should save options to history', () => {
        const drawSpy = spyOn(shape, 'draw').and.callThrough();
        const position = { x: 5, y: 10 };
        shape.draw({ position, color: 'color', radius: 1 });
        expect(shape['history'].length).toEqual(1);
        shape['history'][0](shape);
        expect(drawSpy).toHaveBeenCalledTimes(2);
    });

    it('pause should save command to history', () => {
        const pauseSpy = spyOn(shape, 'pause').and.callThrough();
        shape.pause();
        expect(shape['history'].length).toEqual(1);
        shape['history'][0](shape);
        expect(pauseSpy).toHaveBeenCalledTimes(2);
    });

    it('end should save command to history and return history', () => {
        const getPaintModeSpy = spyOn(shape, 'getPaintMode').and.returnValue(PaintMode.None);
        const endSpy = spyOn(shape, 'end').and.callThrough();
        const history = shape.end();
        expect(history.paintMode).toEqual(PaintMode.None);
        expect(history.commands.length).toEqual(1);

        expect(shape['history'].length).toEqual(1);
        shape['history'][0](shape);
        expect(endSpy).toHaveBeenCalledTimes(2);
        expect(getPaintModeSpy).toHaveBeenCalled();
    });

    it('executeFromCommand should execute all commands from history', () => {
        const beginSpy = spyOn(shape, 'begin').and.callThrough();
        const drawSpy = spyOn(shape, 'draw').and.callThrough();
        const pauseSpy = spyOn(shape, 'pause').and.callThrough();
        const endSpy = spyOn(shape, 'end').and.callThrough();
        const position = { x: 5, y: 10 };
        shape.begin(position);
        shape.draw({ position, color: 'color', radius: 1 });
        shape.pause();
        const command = shape.end();
        shape.executeFromCommand(command);
        expect(beginSpy).toHaveBeenCalledTimes(2);
        expect(drawSpy).toHaveBeenCalledTimes(2);
        expect(pauseSpy).toHaveBeenCalledTimes(2);
        expect(endSpy).toHaveBeenCalledTimes(2);
    });
});
