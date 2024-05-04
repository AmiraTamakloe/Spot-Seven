import { ReplayService } from '@app/services/replay/replay.service';
import { ReplayEvent, ReplayEventResponse } from '@common/model/events/replay.events';
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class ReplayInterceptor implements NestInterceptor {
    private readonly logger = new Logger(ReplayInterceptor.name);

    constructor(private replayService: ReplayService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const ctx = context.switchToWs();
        const event = ctx.getPattern() as ReplayEvent | undefined;
        const body = ctx.getData();

        return next.handle().pipe(
            tap((response: ReplayEventResponse) => {
                try {
                    const isEventNotOfReplayType = event === undefined;
                    if (isEventNotOfReplayType) {
                        return;
                    }

                    this.replayService.saveGameEvent(ctx.getClient().id, event, body, response);
                } catch (e) {
                    this.logger.error(
                        `Error saving game event for user ${ctx.getClient().id} with event ${event}, with body ${JSON.stringify(body)} - ${e}`,
                    );
                }
            }),
        );
    }
}
