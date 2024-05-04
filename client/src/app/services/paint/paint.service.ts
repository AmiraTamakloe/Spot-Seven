import { Injectable } from '@angular/core';
import { Bucket } from '@app/classes/bucket/bucket';
import { AirBrush } from '@app/classes/airbrush/airbrush';
import { Ellipse } from '@app/classes/ellipse/ellipse';
import { Eraser } from '@app/classes/eraser/eraser';
import { Pencil } from '@app/classes/pencil/pencil';
import { Rectangle } from '@app/classes/rectangle/rectangle';
import { Shape as ShapeClass } from '@app/classes/shape/shape';
import { HistoryItemType } from '@app/enums/history-item-type';
import { MouseButton } from '@app/enums/mouse-button';
import { PaintMode } from '@app/enums/paint-mode';
import { CanvasAction } from '@app/interfaces/canvas-action';
import { HistoryItem, ShapeHistoryItem } from '@app/interfaces/history';
import { Shape } from '@app/interfaces/shape';
import { CanvasEditorService } from '@app/services/canvas-editor/canvas-editor.service';
import { ImageArea } from '@common/enums/image-area';
import { Coordinate } from '@common/model/coordinate';
import { Subject } from 'rxjs';
import { COLOR_HEX, COLOR_HEX_BASE, IMAGE_HEIGHT, IMAGE_WIDTH, MAX_RANDOM_END_OFFSET, MAX_RANDOM_SHAPES } from '@app/constants';
const DEFAULT_RADIUS = 5;

@Injectable({
    providedIn: 'root',
})
export class PaintService {
    private tempImageSubject = new Subject<CanvasAction>();
    private frontImageSubject = new Subject<CanvasAction>();

    // Observable must be defined after subject
    // eslint-disable-next-line @typescript-eslint/member-ordering
    tempImageObservable = this.tempImageSubject.asObservable();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    frontImageObservable = this.frontImageSubject.asObservable();

    private mode = PaintMode.None;
    private shape?: Shape;
    private paintArea?: ImageArea;
    private color: string = '000000';
    private radius: number = DEFAULT_RADIUS;
    private history: HistoryItem[] = [];
    private historyIndex: number = 0;

    constructor(public canvasEditorService: CanvasEditorService) {}

    reset() {
        this.history = [];
        this.historyIndex = 0;
        this.mode = PaintMode.None;
        this.shape = undefined;
        this.paintArea = undefined;
        this.color = '000000';
        this.radius = DEFAULT_RADIUS;
    }

    onMouseUp() {
        if (!this.shape || !this.paintArea) return;
        this.pushToHistory({ type: HistoryItemType.Shape, command: this.shape.end(), paintArea: this.paintArea });
        this.paintArea = undefined;
    }

    isDrawing(): boolean {
        return this.paintArea !== undefined;
    }

    canUndo() {
        return this.historyIndex > 0;
    }

    canRedo() {
        return this.historyIndex < this.history.length;
    }

    setMode(mode: PaintMode) {
        if (mode === this.mode || this.paintArea !== undefined) return;
        this.mode = mode;
        switch (mode) {
            case PaintMode.Pencil:
                this.shape = new Pencil(this);
                break;

            case PaintMode.Rectangle:
                this.shape = new Rectangle(this);
                break;

            case PaintMode.Eraser:
                this.shape = new Eraser(this);
                break;

            case PaintMode.Ellipse:
                this.shape = new Ellipse(this);
                break;

            case PaintMode.Bucket:
                this.shape = new Bucket(this);
                break;

            case PaintMode.AirBrush:
                this.shape = new AirBrush(this);
                break;
        }
    }

    getPositionFromEvent(event: MouseEvent): Coordinate {
        return { x: event.offsetX, y: event.offsetY };
    }

    onMouseDown(imageArea: ImageArea, event: MouseEvent) {
        if (event.button !== MouseButton.Left || this.mode === PaintMode.None || !this.shape) return;
        this.paintArea = imageArea;
        const position = this.getPositionFromEvent(event);
        this.shape.begin(position);
        this.shape.draw({ position, color: this.color, radius: this.radius });
    }

    onMouseMove(imageArea: ImageArea, event: MouseEvent) {
        if (this.paintArea !== imageArea || !this.shape) return;
        this.shape.draw({ position: this.getPositionFromEvent(event), color: this.color, radius: this.radius, isShifted: event.shiftKey });
    }

    onMouseLeave(imageArea: ImageArea, event: MouseEvent) {
        if (this.paintArea !== imageArea || !this.shape) return;
        const position = this.getPositionFromEvent(event);
        this.shape.draw({ position, color: this.color, radius: this.radius, isShifted: event.shiftKey });
        this.shape.pause();
    }

    drawOnTemp(action: (context: CanvasRenderingContext2D) => void) {
        if (this.paintArea === undefined) return;
        this.tempImageSubject.next({ imageArea: this.paintArea, action });
    }

    drawOnFront(action: (context: CanvasRenderingContext2D) => void) {
        if (this.paintArea === undefined) return;
        this.frontImageSubject.next({ imageArea: this.paintArea, action });
    }

    pushToHistory(historyItem: HistoryItem) {
        if (this.historyIndex !== this.history.length) {
            this.history.splice(this.historyIndex);
        }
        this.history.push(historyItem);
        this.historyIndex++;
    }

    clearCanvas(paintArea: ImageArea, save: boolean = true) {
        if (this.paintArea !== undefined) return;
        this.frontImageSubject.next({
            imageArea: paintArea,
            action: (context) => {
                this.canvasEditorService.clearCanvas(context);
            },
        });
        if (save) {
            this.pushToHistory({ type: HistoryItemType.Clear, paintArea });
        }
    }

    async duplicate(originImageArea: ImageArea, save: boolean = true) {
        if (this.isDrawing()) return;
        const { leftContext, rightContext } = await this.getFrontContexts();
        if (originImageArea === ImageArea.ORIGINAL) {
            this.canvasEditorService.replaceImageData(leftContext, rightContext);
        } else {
            this.canvasEditorService.replaceImageData(rightContext, leftContext);
        }
        if (save) {
            this.pushToHistory({ type: HistoryItemType.Duplicate, paintArea: originImageArea });
        }
    }

    async intervert(save: boolean = true) {
        if (this.isDrawing()) return;
        const { leftContext, rightContext } = await this.getFrontContexts();
        this.canvasEditorService.intervertImageData(leftContext, rightContext);
        if (save) {
            this.pushToHistory({ type: HistoryItemType.Intervert });
        }
    }

    async getFrontContexts() {
        return await this.canvasEditorService.getContexts(this.frontImageSubject);
    }

    createShapeFromPaintMode(paintMode: PaintMode): ShapeClass | null {
        switch (paintMode) {
            case PaintMode.Pencil:
                return new Pencil(this);
            case PaintMode.Rectangle:
                return new Rectangle(this);
            case PaintMode.Eraser:
                return new Eraser(this);
            case PaintMode.Ellipse:
                return new Ellipse(this);
            case PaintMode.Bucket:
                return new Bucket(this);
            case PaintMode.AirBrush:
                return new AirBrush(this);
            default:
                return null;
        }
    }

    executeShapeHistoryItem(item: ShapeHistoryItem) {
        const shape: ShapeClass | null = this.createShapeFromPaintMode(item.command.paintMode);
        if (!shape) throw new Error("Couldn't recover Shape from command");
        this.paintArea = item.paintArea;
        shape.executeFromCommand(item.command);
        this.paintArea = undefined;
    }

    async executeHistoryItem(item: HistoryItem) {
        switch (item.type) {
            case HistoryItemType.Shape:
                this.executeShapeHistoryItem(item);
                break;
            case HistoryItemType.Clear:
                this.clearCanvas(item.paintArea, false);
                break;
            case HistoryItemType.Duplicate:
                await this.duplicate(item.paintArea, false);
                break;
            case HistoryItemType.Intervert:
                await this.intervert(false);
                break;
        }
    }

    async undo() {
        if (this.isDrawing() || !this.canUndo()) return;
        const { leftContext, rightContext } = await this.canvasEditorService.getContexts(this.frontImageSubject);
        this.canvasEditorService.clearCanvas(leftContext, true);
        this.canvasEditorService.clearCanvas(rightContext, true);
        this.historyIndex--;
        for (const item of this.history.slice(0, this.historyIndex)) {
            await this.executeHistoryItem(item);
        }
    }

    async redo() {
        if (this.isDrawing() || !this.canRedo()) return;
        this.executeHistoryItem(this.history[this.historyIndex]);
        this.historyIndex++;
    }

    colorSetters(hexValue: string) {
        const event = {
            target: document.createElement('input'),
        };
        event.target.value = hexValue;
        this.changeColor(event as unknown as Event);
    }

    randomIntRanged(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    randomEndPosition(startPosition: Coordinate): Coordinate {
        const minX = startPosition.x - MAX_RANDOM_END_OFFSET;
        const maxX = startPosition.x + MAX_RANDOM_END_OFFSET;
        const minY = startPosition.y - MAX_RANDOM_END_OFFSET;
        const maxY = startPosition.y + MAX_RANDOM_END_OFFSET;
        return {
            x: this.randomIntRanged(minX < 0 ? 0 : minX, maxX > IMAGE_WIDTH ? IMAGE_WIDTH : maxX),
            y: this.randomIntRanged(minY < 0 ? 0 : minY, maxY > IMAGE_HEIGHT ? IMAGE_HEIGHT : maxY),
        };
    }

    randomShapeGenerator(startPosition: Coordinate) {
        this.colorSetters('#' + Math.floor(Math.random() * COLOR_HEX).toString(COLOR_HEX_BASE));
        const shapesPossible = [PaintMode.Ellipse, PaintMode.Rectangle, PaintMode.Pencil];
        this.setMode(shapesPossible[this.randomIntRanged(0, shapesPossible.length - 1)]);
        this.onMouseDown(ImageArea.MODIFIED, {
            button: MouseButton.Left,
            offsetX: startPosition.x,
            offsetY: startPosition.y,
        } as MouseEvent);
        const endPositionShape: Coordinate = this.randomEndPosition(startPosition);
        this.onMouseMove(ImageArea.MODIFIED, {
            offsetX: endPositionShape.x,
            offsetY: endPositionShape.y,
        } as MouseEvent);
        this.onMouseUp();
        return endPositionShape;
    }

    randomGenerator() {
        const previousMode = this.mode;
        const previousColor = this.color;
        let startPosition: Coordinate = { x: Math.floor(Math.random() * IMAGE_WIDTH), y: Math.floor(Math.random() * IMAGE_HEIGHT) };
        const numberOfShapes = this.randomIntRanged(2, MAX_RANDOM_SHAPES);
        for (let i = 0; i < numberOfShapes; i++) {
            startPosition = this.randomShapeGenerator(startPosition);
        }
        this.setMode(previousMode);
        this.colorSetters(previousColor);
    }

    changeColor(event: Event) {
        if (this.isDrawing()) return;
        const input = event.target as HTMLInputElement;
        this.color = input.value;
    }

    changeRadius(event: Event) {
        if (this.isDrawing()) return;
        const input = event.target as HTMLInputElement;
        this.radius = Number(input.value);
    }
}
