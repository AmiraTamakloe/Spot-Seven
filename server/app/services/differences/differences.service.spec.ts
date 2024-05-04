/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Coordinate } from '@app/model/dto/coordinate.dto';
import { Bitmap } from '@app/model/schema/bitmap';
import { defaultDifferences, difficultDifferences, encodedDifferences } from '@app/samples/differences';
import { BitmapService } from '@app/services/bitmap/bitmap.service';
import { FileService } from '@app/services/file/file.service';
import { Difficulty } from '@common/model/difficulty';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs/promises';
import { join } from 'path';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { DifferencesService } from './differences.service';
import { ASSETS_PATH } from './differences.service.constants';

describe('DifferencesService', () => {
    let service: DifferencesService;
    let emptyImage: Bitmap;
    let image2Diff: Bitmap;
    let image3DiffRadius: Bitmap;
    let image7Diff: Bitmap;
    let image12Diff: Bitmap;
    let fileService: SinonStubbedInstance<FileService>;

    beforeEach(async () => {
        jest.restoreAllMocks();
        fileService = createStubInstance(FileService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [DifferencesService, { provide: FileService, useValue: fileService }, BitmapService],
        }).compile();

        service = module.get<DifferencesService>(DifferencesService);

        const directory = join(process.cwd(), './assets/tests');
        emptyImage = JSON.parse((await fs.readFile(join(directory, 'image_empty.json'))).toString());
        image2Diff = JSON.parse((await fs.readFile(join(directory, 'image_2_diff.json'))).toString());
        image3DiffRadius = JSON.parse((await fs.readFile(join(directory, 'image_3_diff_radius.json'))).toString());
        image7Diff = JSON.parse((await fs.readFile(join(directory, 'image_7_diff.json'))).toString());
        image12Diff = JSON.parse((await fs.readFile(join(directory, 'image_12_diff.json'))).toString());
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('isCoordinateValid() should return if coordinate is valid', () => {
        expect(service['isCoordinateValid'](new Coordinate(-1, 0))).toBe(false);
        expect(service['isCoordinateValid'](new Coordinate(0, -1))).toBe(false);
        expect(service['isCoordinateValid'](new Coordinate(0, 0))).toBe(true);
        expect(service['isCoordinateValid'](new Coordinate(639, 479))).toBe(true);
        expect(service['isCoordinateValid'](new Coordinate(640, 479))).toBe(false);
        expect(service['isCoordinateValid'](new Coordinate(639, 480))).toBe(false);
    });

    it('findDifferences() works with the given examples', async () => {
        expect(service.findDifferences(emptyImage, image2Diff, 0).length).toEqual(2);
        expect(service.findDifferences(emptyImage, image3DiffRadius, 0).length).toEqual(4);
        expect(service.findDifferences(emptyImage, image7Diff, 0).length).toEqual(7);
        expect(service.findDifferences(emptyImage, image12Diff, 0).length).toEqual(12);

        expect(service.findDifferences(emptyImage, image3DiffRadius, 3).length).toEqual(3);
    });

    it('computeDifficulty() should return the right difficulty', async () => {
        expect(service.computeDifficulty(defaultDifferences)).toEqual(Difficulty.Easy);
        expect(service.computeDifficulty(difficultDifferences)).toEqual(Difficulty.Difficult);
        expect(service.computeDifficulty([])).toEqual(Difficulty.Invalid);
    });

    it('getDifferencesImage() should flatten the differences', async () => {
        const image = service.getDifferencesImage(defaultDifferences);
        expect(image).toEqual(defaultDifferences.flat());
    });

    it('saveDifferences() should save differences to file', async () => {
        fileService.saveFile.resolves('path');
        const path = await service.saveDifferences(defaultDifferences);
        expect(path).toEqual('path');
        expect(fileService.saveFile.calledWith(JSON.stringify(encodedDifferences), 'json', ASSETS_PATH)).toBeTruthy();
    });

    it('loadDifferences() should load differences from file', async () => {
        const readFileSpy = jest.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(encodedDifferences));
        const differences = await service.loadDifferences('path');
        expect(differences).toEqual(defaultDifferences);
        expect(readFileSpy).toHaveBeenCalledWith(join(ASSETS_PATH, 'path'), 'utf8');
    });

    it('deleteDifferences() should delete differences from file', async () => {
        const unlinkSpy = jest.spyOn(fs, 'unlink').mockResolvedValue();
        fileService.fileExists.resolves(true);
        await service.deleteDifferences('path');
        expect(unlinkSpy).toHaveBeenCalledWith(join(ASSETS_PATH, 'path'));
    });
});
