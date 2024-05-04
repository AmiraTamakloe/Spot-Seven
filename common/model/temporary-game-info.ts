import { Coordinate } from './coordinate';

export interface TemporaryGameInfo {
    valid: boolean;
    differencesCount: number;
    differencesImage: Coordinate[];
}
