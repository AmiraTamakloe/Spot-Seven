import { Component, Input } from '@angular/core';
import { GameService } from '@app/services/game-service/game.service';
import { ImageArea } from '@common/enums/image-area';

@Component({
    selector: 'app-image-area-game[imageArea][gameService]',
    template: '',
})
export class ImageAreaGameStubComponent {
    @Input() imageArea: ImageArea = ImageArea.BOTH;
    @Input() gameService!: GameService;
}
