import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AccountService } from '@app/services/account/account.service';
import { Statistic } from '@app/interfaces/statistic';
import { Observable, switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class StatisticService {
    private readonly baseUrl: string = environment.serverUrl;
    constructor(private readonly http: HttpClient, private readonly accountService: AccountService) {}

    getStatistics(): Observable<Statistic> {
        return this.accountService.getUser().pipe(
            switchMap((user) => {
                const userId = user._id;
                return this.http.get<Statistic>(`${this.baseUrl}/users/${userId}/statistic/`);
            }),
        );
    }
}
