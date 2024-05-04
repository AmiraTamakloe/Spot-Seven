import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants/image.constants';
import { Bitmap } from '@app/model/schema/bitmap';
import { ImageInfo } from '@app/model/schema/image-info';
import { FileService } from '@app/services/file/file.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import {
    ACCEPTED_COLOR_DEPTH,
    MINIMAL_HEADER_SIZE,
    OFFSET_COLOR_DEPTH,
    OFFSET_FILE_SIZE,
    OFFSET_IMAGE_HEIGHT,
    OFFSET_IMAGE_WIDTH,
    OFFSET_PIXEL_MAP,
    PADDING_BITS,
    PADDING_BYTES,
    HEADER_SIZE,
    BMP_MAGIC,
    FILE_SIZE,
    DIB_HEADER_SIZE,
    OFFSET_DIB_HEADER_SIZE,
    IMAGE_COLOR_PLANES,
    OFFSET_COLOR_PLANES,
    IMAGE_COLOR_DEPTH,
    PIXEL_ARRAY_SIZE,
    EIGHT_BIT_MAX_VALUE,
} from './bitmap.service.constants';
import { UPLOADS_PATH } from '@app/index.constants';

@Injectable()
export class BitmapService {
    constructor(private fileService: FileService) {}

    // Decode base64 image and save it to path. Return path
    async saveImage(base64ImageContent: string): Promise<string> {
        return await this.fileService.saveFile(Buffer.from(base64ImageContent, 'base64'), 'bmp', UPLOADS_PATH);
    }

    decodeHeader(imageContent: Buffer): ImageInfo {
        return {
            signature: imageContent.toString('utf8', 0, 2),
            fileSize: imageContent.readUInt32LE(OFFSET_FILE_SIZE),
            pixelMapStart: imageContent.readUInt32LE(OFFSET_PIXEL_MAP),
            width: imageContent.readInt32LE(OFFSET_IMAGE_WIDTH),
            height: Math.abs(imageContent.readInt32LE(OFFSET_IMAGE_HEIGHT)),
            colorDepth: imageContent.readUInt16LE(OFFSET_COLOR_DEPTH),
            topDown: imageContent.readInt32LE(OFFSET_IMAGE_HEIGHT) < 0,
        };
    }

    // Returns an of arrays containing RGB values of each pixels
    async decodeImage(base64Image: string): Promise<Bitmap> {
        const imageContent = Buffer.from(base64Image, 'base64');
        if (imageContent.length < MINIMAL_HEADER_SIZE) {
            throw new HttpException('Image is too small to have a header', HttpStatus.BAD_REQUEST);
        }

        const imageInfo = this.decodeHeader(imageContent);
        if (imageInfo.signature !== 'BM') {
            throw new HttpException('Image has invalid signature', HttpStatus.BAD_REQUEST);
        } else if (imageInfo.fileSize !== imageContent.length) {
            throw new HttpException('Image size does not equal size in header', HttpStatus.BAD_REQUEST);
        } else if (imageInfo.width !== IMAGE_WIDTH || imageInfo.height !== IMAGE_HEIGHT) {
            throw new HttpException('Image is not 640x480', HttpStatus.BAD_REQUEST);
        } else if (imageInfo.colorDepth !== ACCEPTED_COLOR_DEPTH) {
            throw new HttpException('Image color depth is not 24 bits', HttpStatus.BAD_REQUEST);
        }

        const rowSize = Math.ceil((imageInfo.colorDepth * imageInfo.width) / PADDING_BITS) * PADDING_BYTES;
        if (imageInfo.pixelMapStart + rowSize * imageInfo.height !== imageInfo.fileSize) {
            throw new HttpException('Image size does not equal to calculated size', HttpStatus.BAD_REQUEST);
        }

        const image: Bitmap = { imageInfo, pixels: [] };
        let offset = imageInfo.pixelMapStart;
        for (let row = 0; row < imageInfo.height; row++) {
            const rowEndOffset = offset + rowSize;
            image.pixels.push([]);
            for (let col = 0; col < imageInfo.width; col++, offset += 3) {
                image.pixels[row].push(imageContent.readUintBE(offset, 3));
            }
            offset = rowEndOffset;
        }

        if (!imageInfo.topDown) {
            image.pixels.reverse();
        }

        return image;
    }

    async deleteImageFile(imageFilename: string): Promise<void> {
        if (await this.fileService.fileExists(this.getFullPath(imageFilename))) {
            await fs.unlink(this.getFullPath(imageFilename));
        }
    }

    async decodeImages(leftImageBase64: string, rightImageBase64: string): Promise<{ leftImage: Bitmap; rightImage: Bitmap }> {
        const leftImage = await this.decodeImage(leftImageBase64);
        const rightImage = await this.decodeImage(rightImageBase64);
        return { leftImage, rightImage };
    }

    // Based on https://en.wikipedia.org/wiki/BMP_file_format
    // And on https://medium.com/sysf/bits-to-bitmaps-a-simple-walkthrough-of-bmp-image-format-765dc6857393
    convertToBase64(imageData: number[][]): string {
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

    private createPixelArray(imageData: number[][]): Uint8Array {
        const pixelDataBuffer = Buffer.alloc(PIXEL_ARRAY_SIZE);

        let bufferPointer = 0;

        // Pixel Array - pizelArraySize
        for (let row = IMAGE_HEIGHT - 1; row >= 0; row--) {
            for (let col = 0; col < IMAGE_WIDTH; col += 1) {
                const { red, green, blue } = this.convertNumberToRGB(imageData[row][col]);
                // Red
                pixelDataBuffer[bufferPointer++] = red;
                // Green
                pixelDataBuffer[bufferPointer++] = green;
                // Blue
                pixelDataBuffer[bufferPointer++] = blue;
            }
        }

        return pixelDataBuffer;
    }

    private getFullPath(path: string): string {
        return join(UPLOADS_PATH, path);
    }

    private convertNumberToRGB(color: number) {
        return {
            red: Math.floor(color / (EIGHT_BIT_MAX_VALUE * EIGHT_BIT_MAX_VALUE)),
            green: Math.floor(color / EIGHT_BIT_MAX_VALUE) % EIGHT_BIT_MAX_VALUE,
            blue: color % EIGHT_BIT_MAX_VALUE,
        };
    }
}
