import { ComponentFixture, TestBed } from '@angular/core/testing';

import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { ReplayService } from '@app/services/replay/replay.service';
import { ReplaysListComponent } from './replays-list.component';

describe('ReplaysListComponent', () => {
    let component: ReplaysListComponent;
    let fixture: ComponentFixture<ReplaysListComponent>;
    let replayServiceSpy: jasmine.SpyObj<ReplayService>;
    let classicModeServiceSpy: jasmine.SpyObj<ClassicModeService>;

    beforeEach(async () => {
        replayServiceSpy = jasmine.createSpyObj('ReplayService', ['viewReplay', 'deleteReplay', 'toggleVisibility']);
        classicModeServiceSpy = jasmine.createSpyObj('ClassicModeService', ['']);

        await TestBed.configureTestingModule({
            declarations: [ReplaysListComponent],
            providers: [
                { provide: ReplayService, useValue: replayServiceSpy },
                { provide: ClassicModeService, useValue: classicModeServiceSpy },
            ],
            imports: [...getTranslocoTestingModules()],
        }).compileComponents();

        fixture = TestBed.createComponent(ReplaysListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
