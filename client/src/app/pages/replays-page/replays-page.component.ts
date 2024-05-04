import { Component, OnInit } from '@angular/core';
import { ReplayChange } from '@app/enums/replay-change';
import { ChangedReplay } from '@app/interfaces/changed-replay';
import { ReplayService } from '@app/services/replay/replay.service';
import { ReplayDto } from '@common/model/dto/replay';

@Component({
    selector: 'app-replays-page',
    templateUrl: './replays-page.component.html',
    styleUrl: './replays-page.component.scss',
})
export class ReplaysPageComponent implements OnInit {
    publicReplays: ReplayDto[] = [];
    userReplays: ReplayDto[] = [];

    constructor(private readonly replayService: ReplayService) {}

    ngOnInit(): void {
        this.replayService.getPublicReplays().subscribe((replays: ReplayDto[]) => {
            this.publicReplays = replays;
        });

        this.replayService.getUserReplays().subscribe((replays: ReplayDto[]) => {
            this.userReplays = replays;
        });
    }

    updateUserChangedReplay(changedReplay: ChangedReplay): void {
        const publicReplay = this.publicReplays.find((replay) => replay.id === changedReplay.id);

        if (!publicReplay) {
            return;
        }

        switch (changedReplay.replayChange) {
            case ReplayChange.Delete:
                this.publicReplays = this.publicReplays.filter((replay) => replay.id !== changedReplay.id);
                break;
            case ReplayChange.Visibility:
                publicReplay.isPublic = !publicReplay.isPublic;
                break;
        }
    }
}
