import { Coordinate } from './coordinate';
export enum HintType {
    FirstSecond = 0,
    Third = 1,
}

export enum Divisor {
    Half = 2,
    Quarter = 4,
}
export enum RemainingHints {
    OneHintLeft = 1,
    TwoHintLeft = 2,
    ThreeHintLeft = 3,
}
export interface FirstSecondHint {
    zone: Coordinate;
    hintType: HintType.FirstSecond;
}

export interface ThirdHint {
    position: Coordinate;
    hintType: HintType.Third;
}

export type Hint = FirstSecondHint | ThirdHint;