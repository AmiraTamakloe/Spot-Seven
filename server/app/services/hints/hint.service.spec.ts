/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HintType } from '@common/model/hints';
import { Test, TestingModule } from '@nestjs/testing';
import { HintService } from './hint.service';

describe('HintService', () => {
    let service: HintService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [HintService],
        }).compile();

        service = module.get<HintService>(HintService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getRandomCoordinate() should return a random coordinate', () => {
        const coordinates = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
        expect(service.getRandomCoordinate(coordinates)).toEqual({ x: 1, y: 1 });

        randomSpy.mockReturnValue(0.1);
        expect(service.getRandomCoordinate(coordinates)).toEqual({ x: 0, y: 0 });
        randomSpy.mockRestore();
    });

    it('calculateZone() should return a zone', () => {
        jest.spyOn(service, 'getHintZone').mockReturnValue({ x: 0, y: 0 });

        const result = service.calculateZone(3, { x: 5, y: 4 });

        expect(result).toEqual({ zone: { x: 0, y: 0 }, hintType: HintType.FirstSecond });
    });

    it('getHintZone() should return a zone as Coordinate', () => {
        const result = service.getHintZone({ x: 5, y: 4 }, 2);
        expect(result).toEqual({ x: 0, y: 0 });

        const result2 = service.getHintZone({ x: 639, y: 479 }, 4);
        expect(result2).toEqual({ x: 480, y: 360 });
    });
});
