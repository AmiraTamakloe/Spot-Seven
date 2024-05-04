import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import { FileService } from './file.service';

describe('FileService', () => {
    let service: FileService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [FileService],
        }).compile();

        service = module.get<FileService>(FileService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('saveFile should save the given file to the given path', async () => {
        const writeFileSpy = jest.spyOn(fs, 'writeFile').mockImplementation();
        const randomUUIDSpy = jest.spyOn(crypto, 'randomUUID').mockReturnValue('randomUUID');

        const path = await service.saveFile('fileContent', 'extension', 'path');
        expect(path).toEqual('randomUUID.extension');
        expect(writeFileSpy).toHaveBeenCalledWith('path/randomUUID.extension', 'fileContent');
        expect(randomUUIDSpy).toHaveBeenCalled();
    });

    it('saveFile should throw if an error accurs', async () => {
        const error = new Error('lolilol');
        jest.spyOn(fs, 'stat').mockImplementation(async () => {
            throw error;
        });
        jest.spyOn(crypto, 'randomUUID').mockReturnValue('randomUUID');

        await expect(service.saveFile('fileContent', 'extension', 'path')).rejects.toThrow(error);
    });
});
