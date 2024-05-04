import { Component, Input, OnInit } from '@angular/core';
import { CanvasAction } from '@app/interfaces/canvas-action';
import { GameService } from '@app/services/game-service/game.service';
import { ImageArea } from '@common/enums/image-area';
import { Observable } from 'rxjs';
@Component({
    selector: 'app-image-area-game[imageArea][gameService]',
    templateUrl: './image-area-game.component.html',
    styleUrls: ['./image-area-game.component.scss'],
})
export class ImageAreaGameComponent implements OnInit {
    @Input() imageArea: ImageArea = ImageArea.BOTH;
    @Input() gameService!: GameService;
    imageObservable!: Observable<CanvasAction>;
    errorObservable!: Observable<CanvasAction>;

    get canvasClass(): string {
        return this.imageArea === ImageArea.ORIGINAL ? 'left' : 'right';
    }

    ngOnInit() {
        this.imageObservable = this.gameService.actionImageObservable;
        this.errorObservable = this.gameService.actionErrorObservable;
    }

    onClick(event: MouseEvent) {
        this.gameService.handleClick(this.imageArea, event);
    }
}
