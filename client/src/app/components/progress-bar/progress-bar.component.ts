import { Component, Input } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { Replay } from '@app/classes/replay/replay';

@Component({
    selector: 'app-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrl: './progress-bar.component.scss',
})
export class ProgressBarComponent {
    @Input() replay!: Replay;
    color: ThemePalette = 'primary';
    mode: ProgressBarMode = 'determinate';
    bufferValue = 0;

    onMouseLeave() {
        this.replay.manualRestart = true;
    }

    onMouseDown() {
        this.replay.manualMoving = true;
    }
}
