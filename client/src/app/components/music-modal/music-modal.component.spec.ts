import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MusicModalComponent } from './music-modal.component';
import { MusicService } from '@app/services/music/music.service';
import SpyObj = jasmine.SpyObj;
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('MusicModalComponent', () => {
    let component: MusicModalComponent;
    let fixture: ComponentFixture<MusicModalComponent>;
    let musicServiceSpy: jasmine.SpyObj<MusicService>;
    let modalRefSpy: SpyObj<MatDialogRef<MusicModalComponent>>;
    // eslint-disable-next-line prefer-const
    musicServiceSpy = jasmine.createSpyObj('MusicService', ['playMusicFromAssets', 'playMusicFromBase64', 'saveMusic']);

    beforeEach(async () => {
        modalRefSpy = jasmine.createSpyObj('MatDialogRef<MusicModalComponent>', ['open', 'close']);
        await TestBed.configureTestingModule({
            declarations: [MusicModalComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef<MusicModalComponent>, useValue: modalRefSpy },
                { provide: MusicService, useValue: musicServiceSpy },
            ],
            imports: [HttpClientTestingModule],
        }).compileComponents();

        fixture = TestBed.createComponent(MusicModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
