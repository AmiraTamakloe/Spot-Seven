import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Preferences } from '@app/enums/preferences';
import { PreferencesDto } from '@app/interfaces/preferences';
import { AccountService } from '@app/services/account/account.service';
import { Observable, map, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PreferencesService {
    preferences!: PreferencesDto;
    private readonly baseUrl: string = environment.serverUrl;
    constructor(private readonly http: HttpClient, private readonly accountService: AccountService) {}

    canSetPreferences(): boolean {
        return this.accountService.isLoggedIn();
    }
    getAccountPreferences(): Observable<PreferencesDto> {
        return this.accountService.getUser().pipe(
            switchMap((user) => {
                const userId = user._id;
                return this.http.get<PreferencesDto>(`${this.baseUrl}/preferences/${userId}`).pipe(map((response) => response));
            }),
        );
    }

    updateAccountPreferences(preferences: PreferencesDto, type: Preferences) {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.http.put<PreferencesDto>(`${this.baseUrl}/preferences/${type}`, preferences).subscribe(() => {});
    }
}
