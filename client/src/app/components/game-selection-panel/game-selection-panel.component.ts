import { Component, Input, OnInit } from '@angular/core';
import { GameSelectionService } from '@app/services/game-selection/game-selection.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { ExistingGame } from '@common/model/game';

@Component({
    selector: 'app-game-selection-panel',
    templateUrl: './game-selection-panel.component.html',
    styleUrls: ['./game-selection-panel.component.scss'],
})
export class GameSelectionPanelComponent implements OnInit {
    @Input() isConfig: boolean = false;

    constructor(public gameSelectionService: GameSelectionService, public themeService: ThemeService) {}
    ngOnInit() {
        this.gameSelectionService.fetchGames();
    }

    id(_: number, item: ExistingGame) {
        return item._id;
    }
}
