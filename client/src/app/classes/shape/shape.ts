import { History, HistoryEnabledOf, HistoryEntryOf } from '@app/decorators/history/history';
import { PaintMode } from '@app/enums/paint-mode';
import { Command } from '@app/interfaces/command';
import { DrawOptions, Shape as ShapeInterface } from '@app/interfaces/shape';
import { PaintService } from '@app/services/paint/paint.service';
import { Coordinate } from '@common/model/coordinate';

export abstract class Shape implements ShapeInterface, HistoryEnabledOf<Shape> {
    protected parent: PaintService;
    private history: HistoryEntryOf<Shape>[] = [];

    constructor(parent: PaintService) {
        this.parent = parent;
    }

    // These three functions need to exist so they can be overriden
    // They can't be abstract because of the decorator

    @History(true)
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, no-unused-vars
    begin(position: Coordinate) {}

    @History()
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, no-unused-vars
    draw(options: DrawOptions) {}

    @History()
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, no-unused-vars
    pause() {}

    @History()
    end(): Command {
        return {
            paintMode: this.getPaintMode(),
            commands: this.history,
        };
    }

    addToHistory(entry: HistoryEntryOf<Shape>) {
        this.history.push(entry);
    }

    clearHistory() {
        this.history = [];
    }

    executeFromCommand(command: Command) {
        command.commands.forEach((shapeAction) => {
            shapeAction(this);
        });
    }

    abstract getPaintMode(): PaintMode;
}
