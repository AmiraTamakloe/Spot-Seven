import { ImageArea } from '@common/enums/image-area';
import { Coordinate } from './coordinate';

export interface Guess {
    imageArea: ImageArea;
    coordinate: Coordinate;
}