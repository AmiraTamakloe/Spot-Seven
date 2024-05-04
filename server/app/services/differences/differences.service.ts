import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants/image.constants';
import { StrictMap } from '@app/data-structures/strict-map';
import { UnionFind } from '@app/data-structures/union-find';
import { Coordinate } from '@app/model/dto/coordinate.dto';
import { Bitmap } from '@app/model/schema/bitmap';
import { FileService } from '@app/services/file/file.service';
import { Difficulty } from '@common/model/difficulty';
import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import {
    ASSETS_PATH,
    COORDINATE_ENCODING_LENGTH,
    DIFFERENCES_MAX,
    DIFFERENCES_MIN,
    DIFFICULT_MAXIMAL_AREA,
    DIFFICULT_MINIMAL_DIFFERENCES,
} from './differences.service.constants';
import { BitmapService } from '@app/services/bitmap/bitmap.service';

@Injectable()
export class DifferencesService {
    constructor(private fileService: FileService, private bitmapService: BitmapService) {}

    computeDifficulty(differences: Coordinate[][]): Difficulty {
        if (differences.length < DIFFERENCES_MIN || differences.length > DIFFERENCES_MAX) return Difficulty.Invalid;
        return differences.length >= DIFFICULT_MINIMAL_DIFFERENCES && differences.flat().length < IMAGE_HEIGHT * IMAGE_WIDTH * DIFFICULT_MAXIMAL_AREA
            ? Difficulty.Difficult
            : Difficulty.Easy;
    }

    getDifferencesImage(differences: Coordinate[][]): Coordinate[] {
        return differences.flat();
    }

    async saveDifferences(differences: Coordinate[][]): Promise<string> {
        const encodedDifferences = differences.map((difference) => this.encodeDifference(difference));
        return await this.fileService.saveFile(JSON.stringify(encodedDifferences), 'json', ASSETS_PATH);
    }

    async loadDifferences(path: string): Promise<Coordinate[][]> {
        const encodedDifferences = await fs.readFile(join(ASSETS_PATH, path), 'utf8');
        return JSON.parse(encodedDifferences).map((difference: string) => this.decodeDifference(difference));
    }

    async deleteDifferences(path: string): Promise<void> {
        const fullPath = join(ASSETS_PATH, path);
        if (await this.fileService.fileExists(fullPath)) {
            await fs.unlink(fullPath);
        }
    }

    // Returns an array of arrays of pixels (containing the differences, usually 7)
    findDifferences(originalImage: Bitmap, modifiedImage: Bitmap, radius: number): Coordinate[][] {
        const differences = new UnionFind();
        const visited: Set<string> = new Set();

        for (let x = 0; x < IMAGE_WIDTH; x++) {
            for (let y = 0; y < IMAGE_HEIGHT; y++) {
                let currentPixel = new Coordinate(x, y);
                if (visited.has(currentPixel.hash())) {
                    continue;
                }

                if (!this.isDifferent(currentPixel, originalImage, modifiedImage)) {
                    visited.add(currentPixel.hash());
                    continue;
                }

                const currentSet = currentPixel.hash();
                const neighbours = [currentPixel];
                while (!(neighbours.length === 0)) {
                    currentPixel = neighbours.pop() as Coordinate;
                    if (visited.has(currentPixel.hash()) && differences.connected(currentSet, currentPixel.hash())) {
                        continue;
                    }
                    visited.add(currentPixel.hash());
                    differences.union(currentSet, currentPixel.hash());

                    const immediateNeighbours = this.getImmediateNeighbours(currentPixel);

                    if (this.isDifferent(currentPixel, originalImage, modifiedImage)) {
                        for (const neighbour of immediateNeighbours) {
                            if (!this.isDifferent(neighbour, originalImage, modifiedImage)) {
                                neighbours.push(...this.getRadiusNeighbours(currentPixel, radius));
                                break;
                            }
                        }
                    }

                    immediateNeighbours.forEach((neighbour) => {
                        if (differences.inSet(neighbour.hash())) {
                            differences.union(currentSet, neighbour.hash());
                        }
                    });
                }
            }
        }

        const result: Coordinate[][] = [...Array(differences.roots.size)].map(() => []);
        const setToIndex = new StrictMap<string, number>();
        let index = 0;
        differences.roots.forEach((root) => setToIndex.set(root, index++));
        for (const difference of differences.map.entries()) {
            result[setToIndex.get(differences.find(difference[1]) as string)].push(Coordinate.fromHash(difference[0]));
        }

        return result;
    }

    async coordinatesFromString(coordinatesSet: Set<string>[]) {
        const coordinatesArray = new Array<Coordinate[]>();
        let counter = 0;
        for await (const coordinates of coordinatesSet) {
            coordinatesArray[counter] = new Array<Coordinate>();
            for (const coordinate of coordinates) {
                coordinatesArray[counter].push(Coordinate.fromHash(coordinate));
            }
            counter++;
        }
        return coordinatesArray;
    }

    // all the parameters are needed
    // eslint-disable-next-line max-params
    async keepXDifferences(originalImage: Bitmap, originalModifiedImage: Bitmap, differencesSet: Set<string>[], numberOfDifferences: number) {
        const differences = await this.coordinatesFromString(differencesSet);
        const differencesKeptIndexes = this.getRandomDifferencesIndexes(differences.length, Math.min(numberOfDifferences, differences.length));
        const differencesKept = differencesKeptIndexes.map((index) => differences[index]);

        for await (const difference of differencesKept) {
            for (const coordinate of difference) {
                originalImage.pixels[coordinate.y][coordinate.x] = originalModifiedImage.pixels[coordinate.y][coordinate.x];
            }
        }

        const modifiedB64image = this.bitmapService.convertToBase64(originalImage.pixels);
        const modifiedImageFilename = await this.bitmapService.saveImage(modifiedB64image);
        const differencesFilename = await this.saveDifferences(differencesKept);
        return { modifiedImageFilename, differencesFilename, differencesKeptIndexes };
    }

    encodeDifference(difference: Coordinate[]): string {
        const buffer = Buffer.alloc(difference.length * COORDINATE_ENCODING_LENGTH);
        difference.forEach((coordinate, index) => {
            buffer.writeUInt16LE(coordinate.x, index * COORDINATE_ENCODING_LENGTH);
            buffer.writeUInt16LE(coordinate.y, index * COORDINATE_ENCODING_LENGTH + 2);
        });
        return buffer.toString('base64');
    }

    private decodeDifference(content: string): Coordinate[] {
        const buffer = Buffer.from(content, 'base64');
        const difference: Coordinate[] = [];
        for (let i = 0; i < buffer.length; i += COORDINATE_ENCODING_LENGTH) {
            difference.push(new Coordinate(buffer.readUInt16LE(i), buffer.readUInt16LE(i + 2)));
        }
        return difference;
    }

    private getRandomDifferencesIndexes(differencesLength: number, numberOfDifferences: number): number[] {
        const indexes: number[] = [];
        while (indexes.length < numberOfDifferences) {
            const index = Math.floor(Math.random() * differencesLength);
            if (!indexes.includes(index)) {
                indexes.push(index);
            }
        }
        return indexes;
    }

    private isCoordinateValid(coord: Coordinate): boolean {
        return coord.x >= 0 && coord.x < IMAGE_WIDTH && coord.y >= 0 && coord.y < IMAGE_HEIGHT;
    }

    private getSquareNeighbours(coord: Coordinate, distance: number): Coordinate[] {
        const neighbours: Coordinate[] = [];
        for (let x = coord.x - distance; x <= coord.x + distance; x++) {
            for (let y = coord.y - distance; y <= coord.y + distance; y++) {
                const candidate = new Coordinate(x, y);
                if (this.isCoordinateValid(candidate) && !coord.equals(candidate)) {
                    neighbours.push(candidate);
                }
            }
        }
        return neighbours;
    }

    private isInCircle(coord: Coordinate, center: Coordinate, radius: number): boolean {
        return Math.pow(coord.x - center.x, 2) + Math.pow(coord.y - center.y, 2) <= Math.pow(radius, 2);
    }

    private getRadiusNeighbours(coord: Coordinate, radius: number): Coordinate[] {
        const candidates = this.getSquareNeighbours(coord, radius);
        return candidates.filter((candidate) => this.isInCircle(candidate, coord, radius));
    }

    // Returns an array of pixels containing the neighbours of a pixel
    private getImmediateNeighbours(coord: Coordinate): Coordinate[] {
        return this.getSquareNeighbours(coord, 1);
    }

    private getColorAtCoordinate(coord: Coordinate, image: Bitmap): number {
        return image.pixels[coord.y][coord.x];
    }

    private pixelsAreDifferent(originalPixel: number, modifiedPixel: number): boolean {
        return !(originalPixel === modifiedPixel);
    }

    private isDifferent(coordinate: Coordinate, originalImage: Bitmap, modifiedImage: Bitmap): boolean {
        return this.pixelsAreDifferent(this.getColorAtCoordinate(coordinate, originalImage), this.getColorAtCoordinate(coordinate, modifiedImage));
    }
}
