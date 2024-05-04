import { Component, OnInit } from '@angular/core';
import { Statistic } from '@app/interfaces/statistic';
import { StatisticService } from '@app/services/statistic/statistic.service';

@Component({
    selector: 'app-account-statistic',
    templateUrl: './account-statistic.component.html',
    styleUrl: './account-statistic.component.scss',
})
export class AccountStatisticComponent implements OnInit {
    userStatistics!: Statistic;
    constructor(private statisticService: StatisticService) {}

    ngOnInit(): void {
        this.statisticService.getStatistics().subscribe((statistics) => {
            this.userStatistics = statistics;
        });
    }
}
