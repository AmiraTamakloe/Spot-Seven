import { Injectable } from '@angular/core';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants';
import { Buffer } from 'buffer';
import {
    BMP_MAGIC,
    BYTES_PER_PIXEL,
    DIB_HEADER_SIZE,
    FILE_SIZE,
    HEADER_SIZE,
    IMAGE_COLOR_DEPTH,
    IMAGE_COLOR_PLANES,
    OFFSET_COLOR_DEPTH,
    OFFSET_COLOR_PLANES,
    OFFSET_DIB_HEADER_SIZE,
    OFFSET_FILE_SIZE,
    OFFSET_IMAGE_HEIGHT,
    OFFSET_IMAGE_WIDTH,
    OFFSET_PIXEL_MAP,
    PIXEL_ARRAY_SIZE,
} from './canvas.to-base64.service.constants';

@Injectable({
    providedIn: 'root',
})
export class CanvasToBase64Service {
    // Based on https://en.wikipedia.org/wiki/BMP_file_format
    // And on https://medium.com/sysf/bits-to-bitmaps-a-simple-walkthrough-of-bmp-image-format-765dc6857393
    convertToBase64(imageData: Uint8ClampedArray): string {
        const header = this.createFileHeader();
        const pixelData = this.createPixelArray(imageData);

        return Buffer.concat([header, pixelData]).toString('base64');
    }

    private createFileHeader(): Uint8Array {
        const header = Buffer.alloc(HEADER_SIZE);

        header.writeUInt32LE(BMP_MAGIC, 0);

        header.writeUInt32LE(FILE_SIZE, OFFSET_FILE_SIZE);

        header.writeUInt32LE(HEADER_SIZE, OFFSET_PIXEL_MAP);

        header.writeUInt32LE(DIB_HEADER_SIZE, OFFSET_DIB_HEADER_SIZE);

        header.writeInt32LE(IMAGE_WIDTH, OFFSET_IMAGE_WIDTH);

        header.writeInt32LE(IMAGE_HEIGHT, OFFSET_IMAGE_HEIGHT);

        header.writeUInt32LE(IMAGE_COLOR_PLANES, OFFSET_COLOR_PLANES);

        header.writeUInt32LE(IMAGE_COLOR_DEPTH, OFFSET_COLOR_DEPTH);

        return header;
    }

    private createPixelArray(imageData: Uint8ClampedArray): Uint8Array {
        const pixelDataBuffer = Buffer.alloc(PIXEL_ARRAY_SIZE);

        let bufferPointer = 0;

        // Pixel Array - pizelArraySize
        for (let row = IMAGE_HEIGHT - 1; row >= 0; row--) {
            const rowStart = row * IMAGE_WIDTH * BYTES_PER_PIXEL;
            for (let col = 0; col < IMAGE_WIDTH * BYTES_PER_PIXEL; col += BYTES_PER_PIXEL) {
                const pixelDataStart = rowStart + col;
                // Blue
                pixelDataBuffer[bufferPointer++] = imageData[pixelDataStart + 2];
                // Green
                pixelDataBuffer[bufferPointer++] = imageData[pixelDataStart + 1];
                // Red
                pixelDataBuffer[bufferPointer++] = imageData[pixelDataStart];
            }
        }

        return pixelDataBuffer;
    }
}
