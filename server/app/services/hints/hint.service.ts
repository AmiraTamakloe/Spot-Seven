import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants/image.constants';
import { Coordinate } from '@common/model/coordinate';
import { Divisor, FirstSecondHint, HintType, RemainingHints } from '@common/model/hints';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HintService {
    getRandomCoordinate(coordinates: Coordinate[]) {
        return coordinates[Math.floor(Math.random() * coordinates.length)];
    }

    calculateZone(remainingHints: RemainingHints, randomCoord: Coordinate): FirstSecondHint {
        let divisor = Divisor.Half;
        if (remainingHints === RemainingHints.TwoHintLeft) {
            divisor = Divisor.Quarter;
        }

        return { zone: this.getHintZone(randomCoord, divisor), hintType: HintType.FirstSecond };
    }

    getHintZone(randomCoord: Coordinate, divisor: Divisor): Coordinate {
        const x = randomCoord.x;
        const y = randomCoord.y;
        const stepX = IMAGE_WIDTH / divisor;
        const stepY = IMAGE_HEIGHT / divisor;
        const zone: Coordinate = { x: 0, y: 0 };
        zone.x = stepX * Math.floor(x / stepX);
        zone.y = stepY * Math.floor(y / stepY);
        if (x === IMAGE_WIDTH) {
            zone.x = Math.min(x, IMAGE_WIDTH - stepX);
        }
        if (y === IMAGE_HEIGHT) {
            zone.y = Math.min(y, IMAGE_HEIGHT - stepY);
        }
        return zone;
    }
}
