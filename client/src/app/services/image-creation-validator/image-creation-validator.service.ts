import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants';
import { ImageService } from '@app/services/image/image.service';
import { ModalService } from '@app/services/modal/modal.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Coordinate } from '@common/model/coordinate';
import { CreateGameDto } from '@common/model/dto/create-game';
import { CreateTemporaryGameDto } from '@common/model/dto/create-temporary-game';
import { GameCreateEvent } from '@common/model/events/game-create.events';
import { TemporaryGameInfo } from '@common/model/temporary-game-info';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ImageCreationValidatorService {
    differencesData!: TemporaryGameInfo;

    private temporaryGameInfoSubject = new Subject<TemporaryGameInfo>();

    // Lint disabled since imageObservable relies on imageSubject being initialized before it
    // eslint-disable-next-line @typescript-eslint/member-ordering
    temporaryGameInfoObservable = this.temporaryGameInfoSubject.asObservable();

    // Used to inject the required services
    // eslint-disable-next-line max-params
    constructor(
        private imageService: ImageService,
        private socketService: SocketService,
        private router: Router,
        private modalService: ModalService,
    ) {}

    get width(): number {
        return IMAGE_WIDTH;
    }

    get height(): number {
        return IMAGE_HEIGHT;
    }

    async validateImages(detectionRadius: number) {
        const { leftImage, rightImage } = await this.imageService.getImagesAsBase64();
        const images: CreateTemporaryGameDto = {
            leftImage,
            rightImage,
            detectionRadius,
        };

        const modal = this.modalService.createLoadingModal();
        this.socketService.send(GameCreateEvent.CreateTemporaryGame, images, (temporaryGame: TemporaryGameInfo) => {
            modal.close();
            this.differencesData = temporaryGame;
            this.temporaryGameInfoSubject.next(temporaryGame);
        });
    }

    createGame(gameName: string) {
        if (this.differencesData.valid) {
            const gameInfo: CreateGameDto = {
                name: gameName,
            };

            const modal = this.modalService.createLoadingModal();

            this.socketService.send(GameCreateEvent.CreateGame, gameInfo, () => {
                modal.close();
                this.router.navigate(['/config']);
            });
        }
    }

    createImagePreview(previewContext: CanvasRenderingContext2D) {
        if (this.differencesData) {
            const differences = this.differencesData.differencesImage;
            differences.forEach((differentPixel: Coordinate) => previewContext.fillRect(differentPixel.x, differentPixel.y, 1, 1));
        }
    }
}
