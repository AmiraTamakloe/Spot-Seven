import { ComponentFixture, TestBed } from '@angular/core/testing';

import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';
import { ReplayService } from '@app/services/replay/replay.service';
import { of } from 'rxjs';
import { ReplaysPageComponent } from './replays-page.component';

describe('ReplaysPageComponent', () => {
    let component: ReplaysPageComponent;
    let fixture: ComponentFixture<ReplaysPageComponent>;
    let replayServiceSpy: jasmine.SpyObj<ReplayService>;

    beforeEach(async () => {
        replayServiceSpy = jasmine.createSpyObj('ReplayService', ['getPublicReplays', 'getUserReplays']);

        replayServiceSpy.getPublicReplays.and.returnValue(of([]));
        replayServiceSpy.getUserReplays.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            declarations: [ReplaysPageComponent],
            providers: [{ provide: ReplayService, useValue: replayServiceSpy }],
            imports: [...getTranslocoTestingModules()],
        }).compileComponents();

        fixture = TestBed.createComponent(ReplaysPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
