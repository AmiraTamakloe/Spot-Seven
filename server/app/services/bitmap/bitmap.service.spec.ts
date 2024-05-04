/* eslint-disable @typescript-eslint/no-magic-numbers */
import * as globalImageConstants from '@app/constants/image.constants';
import { defaultBitmap, defaultImageInfo } from '@app/samples/bitmap';
import { FileService } from '@app/services/file/file.service';
import { Test, TestingModule } from '@nestjs/testing';
import { promises as fs } from 'fs';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { BitmapService } from './bitmap.service';
import * as globalConstants from '@app/index.constants';

const mockVariable = (object: object, property: string, value: unknown) => {
    Object.defineProperty(object, property, { value });
};

type AvailableColors = 'blue' | 'red' | 'black' | 'white' | 'realBlue' | 'green' | 'yellow';
// eslint-disable-next-line no-bitwise
const getColorByNumber = (red: number, green: number, blue: number) => (blue << 16) + (green << 8) + red;
const getColor = (color: AvailableColors) => {
    switch (color) {
        case 'blue':
            return getColorByNumber(64, 0, 255);
        case 'red':
            return getColorByNumber(255, 0, 0);
        case 'black':
            return getColorByNumber(0, 0, 0);
        case 'white':
            return getColorByNumber(255, 255, 255);
        case 'realBlue':
            return getColorByNumber(0, 0, 255);
        case 'green':
            return getColorByNumber(0, 255, 0);
        case 'yellow':
            return getColorByNumber(255, 255, 0);
    }
};

interface Entry {
    color: AvailableColors;
    times: number;
}
type MyEntry = Entry | AvailableColors;

const colorsToPixels = (colors: MyEntry[][]) =>
    colors.map((row) => {
        let rowNumbers: number[] = [];
        row.forEach((entry) => {
            if (typeof entry === 'string') {
                rowNumbers.push(getColor(entry));
            } else {
                rowNumbers = rowNumbers.concat([...Array(entry.times)].map(() => getColor(entry.color)));
            }
        });
        return rowNumbers;
    });

describe('BitmapService', () => {
    let service: BitmapService;
    const defaultBuffer = Buffer.alloc(921654, 'a', 'ascii').toString('base64');
    let fileService: SinonStubbedInstance<FileService>;

    beforeEach(async () => {
        fileService = createStubInstance(FileService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [BitmapService, { provide: FileService, useValue: fileService }],
        }).compile();

        mockVariable(globalConstants, 'UPLOADS_PATH', '/work');
        mockVariable(globalImageConstants, 'IMAGE_WIDTH', 640);
        mockVariable(globalImageConstants, 'IMAGE_HEIGHT', 480);

        service = module.get<BitmapService>(BitmapService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getFullPath should return full path', () => {
        expect(service['getFullPath']('test')).toEqual('/work/test');
    });

    it('saveImage should call fileService.saveFile', async () => {
        fileService.saveFile.resolves('abcdefg.bmp');
        await service.saveImage('aGV5eXl5');
        expect(fileService.saveFile.calledWith(Buffer.from('heyyyy'), 'bmp', globalConstants.UPLOADS_PATH)).toBeTruthy();
    });

    it('decodeHeader should decode image headers', () => {
        const base64Content = 'Qk1kAAAAAAAAADIAAAAAAAAAGQAAAAoAAAAAAAUA';
        const buffer = Buffer.from(base64Content, 'base64');

        expect(service.decodeHeader(buffer)).toEqual({
            signature: 'BM',
            fileSize: 100,
            pixelMapStart: 50,
            width: 25,
            height: 10,
            colorDepth: 5,
            topDown: false,
        });
    });

    it('decodeImage should decode top-down image', async () => {
        mockVariable(globalImageConstants, 'IMAGE_WIDTH', 10);
        mockVariable(globalImageConstants, 'IMAGE_HEIGHT', 8);

        const imageInfo = {
            signature: 'BM',
            fileSize: 310,
            pixelMapStart: 54,
            width: 10,
            height: 8,
            colorDepth: 24,
            topDown: true,
        };

        jest.spyOn(service, 'decodeHeader').mockImplementation(() => imageInfo);

        const base64ContentTopDown =
            'Qk02AQAAAAAAADYAAAAoAAAACgAAAPj///8BABgAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAA//////////////////' +
            '//////////////////////AAD///8AAP////8AAAD///////8AAP////////////8AAP//////////////////////' +
            '/////////////////wAA/////wBA/////////wBA////////////AAAA////AAD///////////////////8AAAD///' +
            '////////////8AAAAAAP///wAA/////////////////////////////wAA////////////////////////////////' +
            '////////AAD/////////////////////////////////AED///8AAA==';

        const colorsTopDown: MyEntry[][] = [
            [{ color: 'white', times: 10 }],
            ['white', 'red', 'white', 'black', { color: 'white', times: 2 }, 'red', { color: 'white', times: 3 }],
            [{ color: 'white', times: 10 }],
            ['white', 'blue', { color: 'white', times: 2 }, 'blue', { color: 'white', times: 3 }, 'black', 'white'],
            [{ color: 'white', times: 5 }, 'black', { color: 'white', times: 4 }],
            ['black', 'white', 'red', { color: 'white', times: 7 }],
            [{ color: 'white', times: 10 }],
            [{ color: 'white', times: 8 }, 'blue', 'white'],
        ];

        expect(await service.decodeImage(base64ContentTopDown)).toEqual({
            imageInfo,
            pixels: colorsToPixels(colorsTopDown),
        });
    });

    it('decodeImage should decode top-down image', async () => {
        mockVariable(globalImageConstants, 'IMAGE_WIDTH', 5);
        mockVariable(globalImageConstants, 'IMAGE_HEIGHT', 5);

        const imageInfo = {
            signature: 'BM',
            fileSize: 134,
            pixelMapStart: 54,
            width: 5,
            height: 5,
            colorDepth: 24,
            topDown: false,
        };

        jest.spyOn(service, 'decodeHeader').mockImplementation(() => imageInfo);

        const base64ContentBottomUp =
            'Qk0AAAAAAAAAADYAAAAoAAAABQAAAAUAAAABABgAAAAAAAAAAAAAAAAAAAAAAAAA' +
            'AAAAAAAA////AAAAAAAAAAAAAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAA' +
            'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAAAAAAAAAP8AAAA=';

        const colorsBottomUp: MyEntry[][] = [
            ['red', { color: 'black', times: 3 }, 'realBlue'],
            [{ color: 'black', times: 5 }],
            [{ color: 'black', times: 2 }, 'green', { color: 'black', times: 2 }],
            [{ color: 'black', times: 5 }],
            ['white', { color: 'black', times: 3 }, 'yellow'],
        ];

        expect(await service.decodeImage(base64ContentBottomUp)).toEqual({
            imageInfo,
            pixels: colorsToPixels(colorsBottomUp),
        });
    });

    it('decodeImage should throw if image too small', async () => {
        await expect(service.decodeImage('notlongenough')).rejects.toThrow('Image is too small to have a header');
    });

    it('decodeImage should throw if wrong signature', async () => {
        jest.spyOn(service, 'decodeHeader').mockImplementation(() => ({ ...defaultImageInfo, signature: 'PNG' }));
        await expect(service.decodeImage(defaultBuffer)).rejects.toThrow('Image has invalid signature');
    });

    it('decodeImage should throw if image has different size in header', async () => {
        jest.spyOn(service, 'decodeHeader').mockImplementation(() => ({ ...defaultImageInfo, fileSize: 5 }));
        await expect(service.decodeImage(defaultBuffer)).rejects.toThrow('Image size does not equal size in header');
    });

    it('decodeImage should throw if image has wrong resolution', async () => {
        jest.spyOn(service, 'decodeHeader').mockImplementation(() => ({ ...defaultImageInfo, width: 100 }));
        await expect(service.decodeImage(defaultBuffer)).rejects.toThrow('Image is not 640x480');

        jest.spyOn(service, 'decodeHeader').mockImplementation(() => ({ ...defaultImageInfo, height: 100 }));
        await expect(service.decodeImage(defaultBuffer)).rejects.toThrow('Image is not 640x480');
    });

    it('decodeImage should throw if image has wrong color depth', async () => {
        jest.spyOn(service, 'decodeHeader').mockImplementation(() => ({ ...defaultImageInfo, colorDepth: 16 }));
        await expect(service.decodeImage(defaultBuffer)).rejects.toThrow('Image color depth is not 24 bits');
    });

    it('decodeImage should throw if image has wrong size', async () => {
        jest.spyOn(service, 'decodeHeader').mockImplementation(() => ({ ...defaultImageInfo, fileSize: 500 }));
        const buffer = Buffer.alloc(500, 'a', 'ascii').toString('base64');
        await expect(service.decodeImage(buffer)).rejects.toThrow('Image size does not equal to calculated size');
    });

    it('deleteImageFile should call fs.unlink', async () => {
        const unlinkSpy = jest.spyOn(fs, 'unlink').mockImplementation(async () => undefined);
        // @ts-expect-error error is not important
        const getFullPathSpy = jest.spyOn(service, 'getFullPath').mockImplementation(() => 'blablabli');

        fileService.fileExists.resolves(true);

        await service.deleteImageFile('myfilename.bmp');

        expect(getFullPathSpy).toHaveBeenCalled();
        expect(getFullPathSpy).toHaveBeenCalledWith('myfilename.bmp');

        expect(unlinkSpy).toHaveBeenCalled();
        expect(unlinkSpy).toHaveBeenCalledWith('blablabli');
    });

    it('decodeImages should decode both images', async () => {
        const decodeImageSpy = jest.spyOn(service, 'decodeImage');
        const leftImage = { ...defaultBitmap, imageFilename: 'abc.bmp' };
        const rightImage = { ...defaultBitmap, imageFilename: 'def.bmp' };
        decodeImageSpy
            .mockImplementation(async () => defaultBitmap)
            .mockImplementationOnce(async () => leftImage)
            .mockImplementationOnce(async () => rightImage);

        expect(await service.decodeImages('abcd', 'efgh')).toEqual({ leftImage, rightImage });

        expect(decodeImageSpy).toHaveBeenNthCalledWith(1, 'abcd');
        expect(decodeImageSpy).toHaveBeenNthCalledWith(2, 'efgh');
    });

    it('decodeImages should delete images if an exception happens', async () => {
        const decodeImageSpy = jest.spyOn(service, 'decodeImage');
        const error = new Error('left');
        decodeImageSpy
            .mockImplementation(async () => defaultBitmap)
            .mockImplementationOnce(async () => defaultBitmap)
            .mockImplementationOnce(async () => {
                throw error;
            });

        await expect(service.decodeImages('abcd', 'efgh')).rejects.toThrow(error);
    });
});
