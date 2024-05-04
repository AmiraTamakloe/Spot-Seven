import { Coordinate } from '@app/model/dto/coordinate.dto';
import { TemporaryGameInfo as TemporaryGameInfoInterface } from '@common/model/temporary-game-info';

export class TemporaryGameInfo implements TemporaryGameInfoInterface {
    valid: boolean;
    differencesCount: number;
    differencesImage: Coordinate[];

    constructor(valid: boolean, differencesCount: number, differencesImage: Coordinate[]) {
        this.valid = valid;
        this.differencesCount = differencesCount;
        this.differencesImage = differencesImage;
    }
}
