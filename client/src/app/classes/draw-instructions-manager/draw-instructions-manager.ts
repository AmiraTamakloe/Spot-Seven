import { CanvasAction } from '@app/interfaces/canvas-action';
import { GameService } from '@app/services/game-service/game.service';
import { ImageArea } from '@common/enums/image-area';
import { Subject, Subscription } from 'rxjs';
import { DRAW_FREQUENCY } from './draw-instructions-manager.constants';

export interface DrawInstruction {
    imageArea: ImageArea;
    action: (context: CanvasRenderingContext2D, index: number) => void;
    executionsLeft?: number;
}

export class DrawInstructionsManager {
    instructions: DrawInstruction[] = [];
    drawInterval!: ReturnType<typeof setInterval>;

    private actionErrorSubject: Subject<CanvasAction>;
    private gameService: GameService;
    private executionIndex = 0;
    private replaySpeedChangedObserver: Subscription;

    constructor(actionErrorSubject: Subject<CanvasAction>, gameService: GameService) {
        this.actionErrorSubject = actionErrorSubject;
        this.gameService = gameService;
        this.scheduleExecution(this.gameService.replayInstance?.speed || 1);
        this.replaySpeedChangedObserver = this.gameService.replaySpeedChangedObservable.subscribe((speed) => {
            clearTimeout(this.drawInterval);
            this.scheduleExecution(speed);
        });
    }

    scheduleExecution(speed: number) {
        if (!speed) return;
        const frequency = DRAW_FREQUENCY / speed;

        this.drawInterval = setInterval(async () => {
            const { leftContext, rightContext } = await this.gameService.canvasEditorService.getContexts(this.actionErrorSubject);

            this.gameService.canvasEditorService.clearCanvas(leftContext, true);
            this.gameService.canvasEditorService.clearCanvas(rightContext, true);

            this.instructions = this.instructions.filter((instruction) => {
                if (instruction.executionsLeft !== undefined) {
                    if (instruction.executionsLeft <= 0) {
                        return false;
                    }
                    instruction.executionsLeft--;
                }
                switch (instruction.imageArea) {
                    case ImageArea.ORIGINAL:
                        instruction.action(leftContext, this.executionIndex);
                        break;
                    case ImageArea.MODIFIED:
                        instruction.action(rightContext, this.executionIndex);
                        break;
                    case ImageArea.BOTH:
                        instruction.action(leftContext, this.executionIndex);
                        instruction.action(rightContext, this.executionIndex);
                        break;
                }
                return true;
            });
            this.executionIndex++;
        }, frequency);
    }

    stopExecution() {
        clearInterval(this.drawInterval);
        this.replaySpeedChangedObserver.unsubscribe();
    }
}
