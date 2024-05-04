import { ComponentFixture, TestBed } from '@angular/core/testing';

import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';
import { ObserverService } from '@app/services/observer/observer.service';
import { ObserverGameSessionComponent } from './observer-game-session.component';

describe('ObserverGameSessionComponent', () => {
    let component: ObserverGameSessionComponent;
    let fixture: ComponentFixture<ObserverGameSessionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [...getTranslocoTestingModules()],
            providers: [{ provide: ObserverService, useValue: ObserverService }],
        }).compileComponents();

        fixture = TestBed.createComponent(ObserverGameSessionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
