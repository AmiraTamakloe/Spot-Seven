import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MusicNames } from '@app/enums/preferences';
import { PreferencesDto } from '@app/interfaces/preferences';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class MusicService {
    audio = new Audio();
    loadedMusic!: string;
    preferences!: PreferencesDto;
    winningSoundEffect!: string;
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient, private preferencesService: PreferencesService) {
        this.audio.addEventListener('ended', () => {
            this.audio.src = '';
        });
    }
    playMusicFromAssets(music: string): void {
        this.audio.pause();
        this.audio.src = './assets/victory-music/' + music;
        this.audio.play();
    }
    playMusicFromBase64(bytes: string): void {
        this.audio.pause();
        this.audio.src = 'data:audio/mpeg;base64,' + bytes;
        this.audio.play();
    }

    playWinningSoundEffect(): void {
        this.getWinningSoundEffect().subscribe((winningSoundEffect) => {
            this.winningSoundEffect = winningSoundEffect;
            if (this.winningSoundEffect === MusicNames.Uploaded) {
                this.playMusicFromBase64(this.loadedMusic);
            } else {
                this.playMusicFromAssets(this.winningSoundEffect);
            }
        });
    }

    getWinningSoundEffect(): Observable<string> {
        return new Observable<string>((observer) => {
            this.preferencesService.getAccountPreferences().subscribe((preferences) => {
                this.preferences = preferences;
                if (this.preferences.music !== undefined) {
                    this.winningSoundEffect = this.preferences.music;
                }

                if (this.winningSoundEffect === 'uploaded') {
                    this.getMusic(this.preferences.userId).subscribe((music) => {
                        this.loadedMusic = music;
                        observer.next(this.winningSoundEffect);
                        observer.complete();
                    });
                } else {
                    observer.next(this.winningSoundEffect);
                    observer.complete();
                }
            });
        });
    }

    getMusic(userId: string) {
        return this.http.get(`${this.baseUrl}/preferences/${userId}/music`, { responseType: 'text' });
    }

    saveMusic(userId: string, music: string) {
        const body = {
            userId,
            music,
        };
        this.http.put(`${this.baseUrl}/preferences/music/uploaded`, body).subscribe();
    }

    encodeBase64(arrayBuffer: ArrayBuffer): string {
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
}
