import { Coordinate } from '@app/model/dto/coordinate.dto';
import { TemporaryGame } from '@app/model/schema/temporary-game';

export interface PendingGame {
    temporaryGame: TemporaryGame;
    originalImageBase64: string;
    modifiedImageBase64: string;
    differences: Coordinate[][];
}
