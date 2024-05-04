/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { DrawableShape } from '@app/classes/drawable-shape/drawable-shape';
import { DELAY, INTERCEPT, SLOPE } from '@app/classes/airbrush/constants';
import { HistoryEnabledOf, History, HistoryEntryOf } from '@app/decorators/history/history';
import { PaintMode } from '@app/enums/paint-mode';
import { Command } from '@app/interfaces/command';
import { DrawOptions } from '@app/interfaces/shape';
export class AirBrush extends DrawableShape implements HistoryEnabledOf<AirBrush> {
    private intervalId: NodeJS.Timeout | undefined = undefined;
    private options: DrawOptions = {
        position: { x: 0, y: 0 },
        color: '',
        radius: 0,
    };
    private context: CanvasRenderingContext2D | undefined;

    @History()
    generateSprayParticles() {
        const density = this.densityCalculator(this.options.radius);
        for (let i = 0; i < density; i++) {
            const offset = this.getRandomOffset(this.options.radius * 2);

            const x = this.options.position.x + offset.x;
            const y = this.options.position.y + offset.y;

            this.context?.fillRect(x, y, 1, 1);
        }
    }

    addToHistory(entry: HistoryEntryOf<AirBrush>) {
        super.addToHistory(entry as HistoryEntryOf<DrawableShape>);
    }

    clearHistory() {
        super.clearHistory();
    }

    getPaintMode(): PaintMode {
        return PaintMode.AirBrush;
    }

    draw(options: DrawOptions) {
        this.parent.drawOnFront((context) => {
            context.strokeStyle = options.color;
            context.fillStyle = options.color;
            this.options = options;
            this.context = context;
            if (this.intervalId === undefined) {
                this.intervalId = setInterval(() => this.generateSprayParticles(), DELAY);
            }
        });
        super.draw(options);
    }

    end(): Command {
        if (this.intervalId !== undefined) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
        }
        return super.end();
    }

    private getRandomOffset(radius: number) {
        const randomAngle = Math.random() * (2 * Math.PI);
        const randomRadius = Math.random() * radius;

        return {
            x: Math.cos(randomAngle) * randomRadius,
            y: Math.sin(randomAngle) * randomRadius,
        };
    }

    private densityCalculator(radius: number): number {
        return INTERCEPT + SLOPE * radius;
    }
}
