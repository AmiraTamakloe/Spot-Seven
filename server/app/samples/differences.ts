import { Coordinate } from '@app/model/dto/coordinate.dto';

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
export const defaultDifferences = [[new Coordinate(1, 5), new Coordinate(2, 3)], [new Coordinate(0, 0)], [new Coordinate(1, 9)]];
export const encodedDifferences = ['AQAFAAIAAwA=', 'AAAAAA==', 'AQAJAA=='];
export const defaultDifferencesCount = defaultDifferences.length;
export const defaultDifferencesImage = defaultDifferences.flat();
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
export const difficultDifferences = [...Array(7)].map(() => [new Coordinate(0, 0)]);
