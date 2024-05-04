import { Coordinate } from '@common/model/coordinate';
import { Command } from './command';

export interface DrawOptions {
    position: Coordinate;
    color: string;
    radius: number;
    isShifted?: boolean;
}

export interface Shape {
    begin: (position: Coordinate) => void;
    draw: (options: DrawOptions) => void;
    end: () => Command;
    pause: () => void;
}
