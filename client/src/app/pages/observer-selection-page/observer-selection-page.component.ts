import { Component, OnInit } from '@angular/core';
import { ObserverService } from '@app/services/observer.service';
import { SocketService } from '@app/services/socket/socket.service';
import { ObserverEvent } from '@common/model/events/observer.events';

@Component({
    selector: 'app-observer-selection-page',
    templateUrl: './observer-selection-page.component.html',
    styleUrl: './observer-selection-page.component.scss',
})
export class ObserverSelectionPageComponent implements OnInit {
    constructor(private socketService: SocketService, public observerService: ObserverService) {
        this.socketService.send(ObserverEvent.FetchGameSessions);
    }

    ngOnInit(): void {
        this.socketService.send(ObserverEvent.FetchGameSessions);
    }
}
