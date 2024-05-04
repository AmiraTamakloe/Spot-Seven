import { Shape } from '@app/classes/shape/shape';
import { HistoryEntryOf } from '@app/decorators/history/history';
import { PaintMode } from '@app/enums/paint-mode';

export type Command = {
    paintMode: PaintMode;
    commands: HistoryEntryOf<Shape>[];
};
