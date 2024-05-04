import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants';
import { CanvasAction } from '@app/interfaces/canvas-action';
import { CanvasEditorService } from '@app/services/canvas-editor/canvas-editor.service';
import { ImageArea } from '@common/enums/image-area';
import { Observable, Subscription } from 'rxjs';
@Component({
    selector: 'app-canvas[imageArea][actionObservable]',
    templateUrl: './canvas.component.html',
    styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements AfterViewInit, OnDestroy {
    @Input() imageArea!: ImageArea;
    @Input() actionObservable!: Observable<CanvasAction>;
    @Input() clearOnCreate: boolean = false;
    @Input() cpuRendering: boolean = true;
    @ViewChild('canvas', { static: false }) private canvas!: ElementRef<HTMLCanvasElement>;
    actionSubscription?: Subscription;

    constructor(private canvasEditorService: CanvasEditorService) {}

    get width(): number {
        return IMAGE_WIDTH;
    }

    get height(): number {
        return IMAGE_HEIGHT;
    }

    ngAfterViewInit(): void {
        const contextAttributes: CanvasRenderingContext2DSettings = {
            willReadFrequently: this.cpuRendering,
        };

        const canvasContext = this.canvas.nativeElement.getContext('2d', contextAttributes) as CanvasRenderingContext2D;

        if (this.clearOnCreate) {
            this.canvasEditorService.clearCanvas(canvasContext);
        }

        const actionObserver = {
            next: ({ imageArea, action }: CanvasAction) => {
                if (imageArea === this.imageArea || imageArea === ImageArea.BOTH) {
                    action(canvasContext);
                }
                return;
            },
        };

        this.actionSubscription = this.actionObservable.subscribe(actionObserver);
    }

    ngOnDestroy(): void {
        this.actionSubscription?.unsubscribe();
    }
}
