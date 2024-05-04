import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ReplayChange } from '@app/enums/replay-change';
import { ChangedReplay } from '@app/interfaces/changed-replay';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { ReplayService } from '@app/services/replay/replay.service';
import { ReplayDto } from '@common/model/dto/replay';

@Component({
    selector: 'app-replays-list',
    templateUrl: './replays-list.component.html',
    styleUrl: './replays-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReplaysListComponent implements AfterViewInit, OnChanges {
    @Input() replays: ReplayDto[] = [];
    @Input() isUserReplays: boolean = false;
    @Output() changedReplay: EventEmitter<ChangedReplay> = new EventEmitter<ChangedReplay>();

    @ViewChild(MatSort)
    sort!: MatSort;

    dataSource = new MatTableDataSource(this.replays);
    publicDisplayedColumns: string[] = ['user', 'gameName', 'createdAt', 'replay'];
    userDisplayedColumns: string[] = ['user', 'gameName', 'createdAt', 'replay', 'visibility', 'delete'];

    constructor(private readonly replayService: ReplayService, private readonly classicModeService: ClassicModeService) {}

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
        this.dataSource.data = this.replays;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.replays) {
            this.replays = changes.replays.currentValue;
            this.dataSource.data = changes.replays.currentValue;
        }
    }

    startReplay(id: string): void {
        this.replayService.viewReplay(id, this.classicModeService);
    }

    deleteReplay(id: string) {
        this.replayService.deleteReplay(id).subscribe();
        this.replays = this.replays.filter((replay) => replay.id !== id);
        this.dataSource.data = this.replays;
        this.changedReplay.emit({ id, replayChange: ReplayChange.Delete });
    }

    toggleVisibility(id: string) {
        this.replayService.toggleVisibility(id).subscribe();
        const modifiedReplay = this.replays.find((replay) => replay.id === id);

        if (!modifiedReplay) {
            return;
        }

        modifiedReplay.isPublic = !modifiedReplay.isPublic;
        this.changedReplay.emit({ id: modifiedReplay.id, replayChange: ReplayChange.Visibility });
    }
}
