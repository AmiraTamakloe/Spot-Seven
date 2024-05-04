import { Coordinate as CoordinateInterface } from '@common/model/coordinate';
import { IsNumber } from 'class-validator';

export class Coordinate implements CoordinateInterface {
    @IsNumber()
    x: number;

    @IsNumber()
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static fromHash(hash: string) {
        const parts = hash.split(',');
        return new Coordinate(Number(parts[0]), Number(parts[1]));
    }

    hash(): string {
        return `${this.x},${this.y}`;
    }

    equals(other: Coordinate) {
        return this.x === other.x && this.y === other.y;
    }
}
