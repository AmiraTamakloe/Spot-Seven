import { Shape } from '@app/classes/shape/shape';
import { NEGATIVE_SHIFT, POSITIVE_SHIFT, COLOR_TOLERANCE } from '@app/classes/bucket/constants';
import { HistoryEnabledOf, History, HistoryEntryOf } from '@app/decorators/history/history';
import { PaintMode } from '@app/enums/paint-mode';
import { DrawOptions } from '@app/interfaces/shape';
import { IMAGE_WIDTH, IMAGE_HEIGHT, COLOR_COMPONENTS } from '@app/constants';
import { Coordinate } from '@common/model/coordinate';
import { DrawableShape } from '@app/classes/drawable-shape/drawable-shape';

export class Bucket extends Shape implements HistoryEnabledOf<Bucket> {
    originalColor: string = '';
    originalRGB: { r: number; g: number; b: number } | null = null;
    // eslint-disable-next-line max-params
    @History()
    bfsColorReplacement(imageData: Uint8ClampedArray, position: Coordinate, replacementColor: string, context: CanvasRenderingContext2D) {
        const visitedMatrix: number[][] = Array.from({ length: IMAGE_HEIGHT }, () => Array(IMAGE_WIDTH).fill(0));
        const queue: Coordinate[] = [position];
        const positionShifter: number[][] = [
            [0, POSITIVE_SHIFT],
            [0, NEGATIVE_SHIFT],
            [POSITIVE_SHIFT, 0],
            [NEGATIVE_SHIFT, 0],
            [POSITIVE_SHIFT, POSITIVE_SHIFT],
            [1, NEGATIVE_SHIFT],
            [NEGATIVE_SHIFT, POSITIVE_SHIFT],
            [NEGATIVE_SHIFT, NEGATIVE_SHIFT],
        ];
        this.originalColor = this.getColorFromImageData(imageData, position);
        this.originalRGB = this.extractRGB(this.originalColor);
        const replacementColorObject = this.hexToRgb(replacementColor);

        while (queue.length) {
            position = queue.shift() as Coordinate;
            if (visitedMatrix[position.y][position.x]) continue;
            visitedMatrix[position.y][position.x] = 1;
            if (this.getColorFromImageData(imageData, position) !== replacementColorObject) {
                context.fillStyle = replacementColorObject;
                context.fillRect(position.x, position.y, 1, 1);
            }

            for (const shifter of positionShifter) {
                const newPosition = { x: position.x + shifter[0], y: position.y + shifter[1] };
                if (
                    newPosition.x < 0 ||
                    newPosition.x >= IMAGE_WIDTH ||
                    newPosition.y < 0 ||
                    newPosition.y >= IMAGE_HEIGHT ||
                    visitedMatrix[newPosition.y][newPosition.x]
                )
                    continue;
                if (this.colorComparator(this.getColorFromImageData(imageData, newPosition))) {
                    queue.push(newPosition);
                }
            }
        }
    }

    addToHistory(entry: HistoryEntryOf<Bucket>) {
        super.addToHistory(entry as HistoryEntryOf<DrawableShape>);
    }

    clearHistory() {
        super.clearHistory();
    }

    draw(options: DrawOptions) {
        const { position, color } = options;

        this.parent.drawOnFront((context) => {
            const imageData = context.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT).data;
            this.bfsColorReplacement(imageData, position, color, context);
        });
    }

    getPaintMode(): PaintMode {
        return PaintMode.Bucket;
    }

    private getColorFromImageData(imageData: Uint8ClampedArray, coordinate: Coordinate): string {
        const pixelPosition = coordinate.y * IMAGE_WIDTH * COLOR_COMPONENTS + coordinate.x * COLOR_COMPONENTS;
        const [red, green, blue, alpha] = imageData.slice(pixelPosition, pixelPosition + COLOR_COMPONENTS);
        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }

    private hexToRgb(hex: string): string {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (r, g, b) => {
            return r + r + g + g + b + b;
        });
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return '';
        return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
    }

    private extractRGB(str: string): { r: number; g: number; b: number } | null {
        const match = str.match(/rgba?\((\d+), (\d+), (\d+), (\d+)/);
        if (match) {
            const [, r, g, b, a] = match.map(Number);
            if (r === 0 && g === 0 && b === 0) {
                if (a === 0) return { r: 255, g: 255, b: 255 };
            }
            return { r, g, b };
        }
        return null;
    }
    private colorComparator(color1: string): boolean {
        const rgb1 = this.extractRGB(color1);
        if (
            rgb1 &&
            this.originalRGB &&
            Math.abs(rgb1?.r - this.originalRGB?.r) > COLOR_TOLERANCE &&
            Math.abs(rgb1?.g - this.originalRGB?.g) > COLOR_TOLERANCE &&
            Math.abs(rgb1?.b - this.originalRGB?.b) > COLOR_TOLERANCE
        ) {
            return false;
        }
        return true;
    }
}
