import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MAX_FILE_SIZE } from '@app/constants';
import { MusicNames } from '@app/enums/preferences';
import { MusicData, MusicOption } from '@app/interfaces/music';
import { ModalService } from '@app/services/modal/modal.service';
import { MusicService } from '@app/services/music/music.service';

@Component({
    selector: 'app-music-modal',
    templateUrl: './music-modal.component.html',
    styleUrl: './music-modal.component.scss',
})
export class MusicModalComponent implements OnInit {
    selectedMusicOption!: string;
    file!: File;
    duration: number = 0;

    // eslint-disable-next-line max-params
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: MusicData,
        public dialogRef: MatDialogRef<MusicModalComponent>,
        private musicService: MusicService,
        private modalService: ModalService,
    ) {}

    ngOnInit(): void {
        this.selectedMusicOption = this.data.selectedMusic;
    }

    selectMusicOption(option: MusicOption): void {
        this.selectedMusicOption = option.music;
        if (option.music !== MusicNames.Uploaded) {
            this.musicService.playMusicFromAssets(option.music);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFileSelected(event: any): void {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            const fileContent = reader.result as ArrayBuffer;

            if (file.size > MAX_FILE_SIZE) {
                this.modalService.createInformationModal('WOWWW', 'Too Big! Trop Gros! Calmos Muchacho!');
                return;
            }

            this.selectedMusicOption = MusicNames.Uploaded;
            const base64Data = this.musicService.encodeBase64(fileContent);
            this.musicService.playMusicFromBase64(base64Data);

            this.musicService.saveMusic(this.data.userId, base64Data);
        };
        reader.readAsArrayBuffer(file);
    }

    saveAndClose(): void {
        if (this.selectedMusicOption) {
            this.dialogRef.close({ music: this.selectedMusicOption });
        }
    }
}
