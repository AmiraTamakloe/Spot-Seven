import { HistoryItemType } from '@app/enums/history-item-type';
import { ImageArea } from '@common/enums/image-area';
import { Command } from './command';

export interface IntervertHistoryItem {
    type: HistoryItemType.Intervert;
}

export interface ImageAreaHistoryItem {
    type: HistoryItemType.Clear | HistoryItemType.Duplicate;
    paintArea: ImageArea;
}

export interface ShapeHistoryItem {
    type: HistoryItemType.Shape;
    command: Command;
    paintArea: ImageArea;
}

export type HistoryItem = IntervertHistoryItem | ImageAreaHistoryItem | ShapeHistoryItem;
