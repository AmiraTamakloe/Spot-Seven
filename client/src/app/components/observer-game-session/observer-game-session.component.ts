import { Component, Input } from '@angular/core';
import { ObserverService } from '@app/services/observer/observer.service';
import { ObserverGameSession } from '@common/interfaces/observer-game-session.interface';

@Component({
    selector: 'app-observer-game-session',
    templateUrl: './observer-game-session.component.html',
    styleUrl: './observer-game-session.component.scss',
})
export class ObserverGameSessionComponent {
    @Input() observerGameSession!: ObserverGameSession;

    constructor(public observerService: ObserverService) {}
}
