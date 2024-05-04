import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { LoadingModalComponent } from '@app/components/loading-modal/loading-modal.component';
import { DEFAULT_RADIUS, IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants';
import { ImageService } from '@app/services/image/image.service';
import { SocketService } from '@app/services/socket/socket.service';
import { GameCreateEvent } from '@common/model/events/game-create.events';
import { TemporaryGameInfo } from '@common/model/temporary-game-info';

import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';
import { ImageCreationValidatorService } from './image-creation-validator.service';
import SpyObj = jasmine.SpyObj;

describe('ImageCreationValidatorService', () => {
    const base64ImageString =
        'Qk0AAAAAAAAAADYAAAAoAAAABQAAAAUAAAABABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////AAAAAAAAAAAAAP\
        //AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAAAAAAAAAP8AAAA=';

    const temporaryGameInfoMock: TemporaryGameInfo = {
        valid: true,
        differencesCount: 3,
        differencesImage: [
            { x: 400, y: 300 },
            { x: 500, y: 250 },
            { x: 560, y: 400 },
        ],
    };

    let imageServiceSpy: SpyObj<ImageService>;
    let socketServiceSpy: SpyObj<SocketService>;
    let modalSpy: SpyObj<MatDialog>;
    let service: ImageCreationValidatorService;
    let mockRouter: SpyObj<Router>;

    beforeEach(() => {
        imageServiceSpy = jasmine.createSpyObj('ImageService', ['getImagesAsBase64']);
        imageServiceSpy.getImagesAsBase64.and.returnValue(Promise.resolve({ leftImage: base64ImageString, rightImage: base64ImageString }));

        socketServiceSpy = jasmine.createSpyObj('SocketService', ['send']);

        modalSpy = jasmine.createSpyObj(MatDialog, ['open']);

        mockRouter = jasmine.createSpyObj(Router, ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                { provide: ImageService, useValue: imageServiceSpy },
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: MatDialog, useValue: modalSpy },
                { provide: Router, useValue: mockRouter },
            ],
            imports: [...getTranslocoTestingModules()],
        });

        service = TestBed.inject(ImageCreationValidatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('validateImages should call createTemporaryGame and change the temporary game subject', async () => {
        const detectionRadius = DEFAULT_RADIUS;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const temporaryGameInfoSubjectSpy = spyOn<any>(service['temporaryGameInfoSubject'], 'next');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketServiceSpy.send.and.callFake((event: string, data: unknown, callback?: (data: any) => void) => {
            expect(event).toEqual(GameCreateEvent.CreateTemporaryGame);
            expect(data).toEqual({
                leftImage: base64ImageString,
                rightImage: base64ImageString,
                detectionRadius,
            });
            if (callback) callback(temporaryGameInfoMock);
        });
        modalSpy.open.and.returnValue({ close: () => undefined } as MatDialogRef<LoadingModalComponent>);

        await service.validateImages(detectionRadius);

        expect(socketServiceSpy.send).toHaveBeenCalled();
        expect(temporaryGameInfoSubjectSpy).toHaveBeenCalledWith(temporaryGameInfoMock);
        expect(modalSpy.open).toHaveBeenCalled();
    });

    it('width should return the canvas x size', () => {
        expect(service.width).toEqual(IMAGE_WIDTH);
    });

    it('height should return the canvas y size', () => {
        expect(service.height).toEqual(IMAGE_HEIGHT);
    });

    it('createImagePreview should draw the different pixels', () => {
        const ctxStub: CanvasRenderingContext2D = CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT).getContext(
            '2d',
        ) as CanvasRenderingContext2D;

        const fillStyleSpy = spyOn(ctxStub, 'fillRect').and.callThrough();

        service.differencesData = temporaryGameInfoMock;

        service.createImagePreview(ctxStub);

        expect(fillStyleSpy).toHaveBeenCalledTimes(temporaryGameInfoMock.differencesCount);
    });

    it("createGame should call the communication's service createGame", () => {
        const gameName = 'My Game';
        service.differencesData = temporaryGameInfoMock;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketServiceSpy.send.and.callFake((event: string, data: unknown, callback?: (data: any) => void) => {
            expect(event).toEqual(GameCreateEvent.CreateGame);
            expect(data).toEqual({
                name: gameName,
            });
            if (callback) callback('ok');
        });
        modalSpy.open.and.returnValue({ close: () => undefined } as MatDialogRef<LoadingModalComponent>);

        service.createGame(gameName);

        expect(socketServiceSpy.send).toHaveBeenCalled();
        expect(modalSpy.open).toHaveBeenCalled();
    });
});
