import { ComponentFixture, TestBed } from '@angular/core/testing';

import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { ObserverService } from '@app/services/observer/observer.service';
import { SocketService } from '@app/services/socket/socket.service';
import { ObserverSelectionPageComponent } from './observer-selection-page.component';

import SpyObj = jasmine.SpyObj;

describe('ObserverSelectionPageComponent', () => {
    let component: ObserverSelectionPageComponent;
    let fixture: ComponentFixture<ObserverSelectionPageComponent>;
    let observerService: SpyObj<ObserverService>;
    let socketService: SpyObj<SocketService>;
    let gameStartService: SpyObj<GameStartService>;

    beforeEach(async () => {
        observerService = jasmine.createSpyObj('ObserverService', ['fetchObservableGames']);
        socketService = jasmine.createSpyObj('SocketService', ['send', 'on']);
        gameStartService = jasmine.createSpyObj('GameStartService', ['launchGame']);

        await TestBed.configureTestingModule({
            imports: [...getTranslocoTestingModules()],
            providers: [
                { provide: ObserverService, useValue: observerService },
                { provide: SocketService, useValue: socketService },
                { provide: GameStartService, useValue: gameStartService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ObserverSelectionPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
