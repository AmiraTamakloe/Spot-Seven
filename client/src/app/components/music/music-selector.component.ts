import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MusicModalComponent } from '@app/components/music-modal/music-modal.component';
import { MusicNames, Preferences } from '@app/enums/preferences';
import { MusicOption } from '@app/interfaces/music';
import { PreferencesDto } from '@app/interfaces/preferences';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import { ThemeService } from '@app/services/theme/theme.service';

@Component({
    selector: 'app-music-selector',
    templateUrl: './music-selector.component.html',
    styleUrl: './music-selector.component.scss',
})
export class MusicSelectorComponent implements OnInit {
    musicOptions: MusicOption[] = [];
    currentSelectedMusic: string = '';
    preferences!: PreferencesDto;

    constructor(private dialog: MatDialog, private preferencesService: PreferencesService, public themeService: ThemeService) {}
    ngOnInit(): void {
        this.initMusicOptions();
        this.preferencesService.getAccountPreferences().subscribe((preferences) => {
            if (preferences?.music) {
                this.currentSelectedMusic = preferences.music;
                this.preferences = preferences as PreferencesDto;
            }
        });
    }

    initMusicOptions(): void {
        this.musicOptions = [
            { music: MusicNames.GoodResult, icon: 'fa-solid fa-trophy', label: 'GOOD RESULT' },
            { music: MusicNames.LevelWin, icon: 'fa-solid fa-star', label: 'LEVEL WIN' },
            { music: MusicNames.Medieval, icon: 'fa-solid fa-democrat', label: 'MEDIEVAL FANFARE' },
            { music: MusicNames.SuccessTrumpets, icon: 'fa-solid fa-guitar', label: 'SUCCESS TRUMPETS' },
            { music: MusicNames.Tadaa, icon: 'fa-solid fa-medal', label: 'TADAA' },
            { music: MusicNames.Uploaded, icon: 'fa-solid fa-upload', label: 'UPLOAD' },
        ];
    }

    async openMusicChoices(): Promise<void> {
        const dialogRef = this.dialog.open(MusicModalComponent, {
            width: '400px',
            data: {
                userId: this.preferences.userId,
                selectedMusic: this.currentSelectedMusic,
                musicOptions: this.musicOptions,
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.currentSelectedMusic = result.music;
                this.preferences = { ...this.preferences, music: this.currentSelectedMusic };
                this.preferencesService.updateAccountPreferences(this.preferences, Preferences.Music);
            }
        });
    }
}
