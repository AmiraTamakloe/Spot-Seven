import { UPLOADS_PATH } from '@app/index.constants';
import { ReplayEventEntity } from '@app/model/database/replay-event.entity';
import { Replay } from '@app/model/database/replay.entity';
import { FileService } from '@app/services/file/file.service';
import { UserService } from '@app/services/user/user.service';
import { ReplayDto } from '@common/model/dto/replay';
import { GameSessionEvent } from '@common/model/events/game-session.events';
import { ReplayEvent, ReplayEventBody, ReplayEventDto, ReplayEventResponse } from '@common/model/events/replay.events';
import { GameInfo } from '@common/model/game-info';
import { GuessResult, ResultType } from '@common/model/guess-result';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REPLAY_FOLDER_PATH } from './replay.constants';

@Injectable()
export class ReplayService {
    private readonly replayListSelect = { id: true, gameName: true, createdAt: true, isPublic: true };

    private readonly replayIdToEvents: Map<string, ReplayEventDto[]> = new Map();
    private readonly userIdToReplayId: Map<string, string> = new Map();
    private readonly replayIdToUsers: Map<string, Set<string>> = new Map();

    // Services are needed
    // eslint-disable-next-line max-params
    constructor(
        private readonly userService: UserService,
        @InjectRepository(Replay) private readonly replayRepository: Repository<Replay>,
        private readonly fileService: FileService,
    ) {}

    async persistReplayForPlayer(userId: string): Promise<void> {
        const user = await this.userService.getUser(userId);

        if (!user) {
            return;
        }

        const events: ReplayEventDto[] = this.createReplayForUser(userId);

        if (events.length === 0) {
            return;
        }

        const gameInfo = this.extractGameInfoFromEvents(events);

        if (!gameInfo) {
            return;
        }

        const replay = new Replay();

        const eventEntities = events.map((event: ReplayEventDto) => this.createReplayEventEntity(event));

        // We know this exists, since we were able to get the events for the user
        replay.sessionId = this.userIdToReplayId.get(userId) as string;
        replay.isPublic = false;
        replay.user = user;
        replay.replayEvents = eventEntities;
        replay.gameName = gameInfo.game.name;

        const originalImageFilename = gameInfo.game.originalImageFilename;
        const modifiedImageFilename = gameInfo.game.modifiedImageFilename;
        replay.originalImageFilename = originalImageFilename;
        replay.modifiedImageFilename = modifiedImageFilename;

        await this.replayRepository.save(replay);
        await this.fileService.copyFile(`${UPLOADS_PATH}/${originalImageFilename}`, `${REPLAY_FOLDER_PATH}/${originalImageFilename}`);
        await this.fileService.copyFile(`${UPLOADS_PATH}/${modifiedImageFilename}`, `${REPLAY_FOLDER_PATH}/${modifiedImageFilename}`);
    }

    async getUserReplays(userId: string): Promise<ReplayDto[]> {
        const replays: Replay[] = await this.replayRepository.find({
            select: {
                ...this.replayListSelect,
                user: { username: true },
            },
            where: { user: { username: userId } },
            relations: {
                user: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });

        return this.mapReplaysToReplayDto(replays);
    }

    async getAllReplays(): Promise<ReplayDto[]> {
        const replays: Replay[] = await this.replayRepository.find({
            select: {
                ...this.replayListSelect,
                user: { username: true },
            },
            where: { isPublic: true },
            relations: {
                user: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });

        return this.mapReplaysToReplayDto(replays);
    }

    async getReplay(id: string): Promise<ReplayEventDto[] | undefined> {
        return (
            await this.replayRepository.findOne({
                where: { id },
                relations: {
                    replayEvents: true,
                },
            })
        )?.replayEvents.map((eventEntity: ReplayEventEntity) => ({
            userId: eventEntity.userId,
            event: eventEntity.event,
            body: eventEntity.body,
            response: eventEntity.response,
            time: eventEntity.time,
        }));
    }

    async toggleReplayVisibility(id: string, userId: string): Promise<HttpStatus.OK | HttpStatus.NOT_FOUND | HttpStatus.UNAUTHORIZED> {
        const replay = await this.replayRepository.findOne({
            where: { id },
            relations: {
                user: true,
            },
        });

        if (!replay) {
            return HttpStatus.NOT_FOUND;
        }

        if (replay.user.username !== userId) {
            return HttpStatus.UNAUTHORIZED;
        }

        replay.isPublic = !replay.isPublic;
        await this.replayRepository.save(replay);

        return HttpStatus.OK;
    }

    // Needed to save the replay events correctly
    // eslint-disable-next-line max-params
    saveGameEventForPlayersInRoom(socketIds: string[], event: ReplayEvent, body: ReplayEventBody, response: ReplayEventResponse): void {
        socketIds.forEach((socketId) => this.saveGameEvent(socketId, event, body, response));
    }

    // Needed to save the replay events correctly
    // eslint-disable-next-line max-params
    saveGameEvent(socketId: string, event: ReplayEvent, body: ReplayEventBody, response: ReplayEventResponse): void {
        const username = this.userService.getUserNameFromSocketId(socketId);

        if (!username) {
            return;
        }

        const userId = username;

        switch (event) {
            case GameSessionEvent.GameStart:
                this.handleGameStart(userId, response as GameInfo);
                break;
            case GameSessionEvent.GuessDifference:
            case GameSessionEvent.UseHint:
            case GameSessionEvent.Message:
            case GameSessionEvent.EndGame:
                this.handleSimpleEvent(userId, event, body, response);
                break;
            default:
                break;
        }
    }

    deleteReplayForUser(userId: string): void {
        const replayId = this.userIdToReplayId.get(userId);

        if (!replayId) {
            return;
        }

        this.userIdToReplayId.delete(userId);

        const replayIdToUsersInReplay = this.replayIdToUsers.get(replayId);

        if (!replayIdToUsersInReplay) {
            return;
        }

        replayIdToUsersInReplay.delete(userId);

        if (replayIdToUsersInReplay.size === 0) {
            this.replayIdToUsers.delete(replayId);
            this.replayIdToEvents.delete(replayId);
        }
    }

    createReplayForUser(userId: string): ReplayEventDto[] {
        const replayId = this.userIdToReplayId.get(userId);

        if (!replayId) {
            return [];
        }

        const filteredEvents =
            this.replayIdToEvents.get(replayId)?.filter((event) => {
                const isUserEvent = event.userId === userId;
                const isDifferenceFound = this.isDifferenceFound(event.event, event?.response);
                const isMessage = event.event === GameSessionEvent.Message;

                return isUserEvent || isDifferenceFound || isMessage;
            }) ?? [];

        return this.ensureEndGameIsLastEvent(filteredEvents);
    }

    async deleteSavedReplay(id: string, userId: string) {
        const replay = await this.getReplayIfOwner(id, userId);

        if (!replay) {
            return HttpStatus.NOT_FOUND;
        }

        await this.replayRepository.delete({ id });
    }

    private async getReplayIfOwner(id: string, userId: string): Promise<Replay | null> {
        const replay = await this.replayRepository.findOne({
            where: { id },
            relations: {
                user: true,
            },
        });

        if (!replay) {
            return null;
        }

        if (replay.user.username !== userId) {
            return null;
        }

        return replay;
    }

    private mapReplaysToReplayDto(replays: Replay[]): ReplayDto[] {
        return replays.map((replay: Replay) => ({
            id: replay.id,
            gameName: replay.gameName,
            createdAt: replay.createdAt.toISOString(),
            user: replay.user.username,
            isPublic: replay.isPublic,
        }));
    }

    private isDifferenceFound(event: ReplayEvent, response: ReplayEventResponse): boolean {
        if (event !== GameSessionEvent.GuessDifference) {
            return false;
        }

        return (response as GuessResult)?.type === ResultType.Success;
    }

    private ensureEndGameIsLastEvent(events: ReplayEventDto[]): ReplayEventDto[] {
        const noEndGameIndex = -1;
        const endGameEventIndex = events.findIndex((event) => event.event === GameSessionEvent.EndGame);

        if (endGameEventIndex === events.length - 1) {
            return events;
        }

        if (endGameEventIndex !== noEndGameIndex) {
            const endGameEvent = events[endGameEventIndex];
            events.splice(endGameEventIndex, 1);
            events.push(endGameEvent);
        }

        return events;
    }

    private handleGameStart(userId: string, response: GameInfo): void {
        const replayId = response.sessionId;
        this.userIdToReplayId.set(userId, replayId);

        if (!this.replayIdToEvents.has(replayId)) {
            this.replayIdToEvents.set(replayId, []);
        }

        if (!this.replayIdToUsers.has(replayId)) {
            this.replayIdToUsers.set(replayId, new Set());
        }

        // We just made sure that the replayId is in the map
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.replayIdToUsers.get(replayId)!.add(userId);

        this.handleSimpleEvent(userId, GameSessionEvent.GameStart, null, response);
    }

    // Required to save the event correctly
    // eslint-disable-next-line max-params
    private handleSimpleEvent(userId: string, event: ReplayEvent, body: ReplayEventBody, response: ReplayEventResponse): void {
        const replayId = this.userIdToReplayId.get(userId);

        if (!replayId) {
            return;
        }

        const replayEvent: ReplayEventDto = {
            userId,
            event,
            body,
            response,
            time: Date.now(),
        };

        this.replayIdToEvents.get(replayId)?.push(replayEvent);
    }

    private extractGameInfoFromEvents(events: ReplayEventDto[]): GameInfo | null {
        const startGameEvent = events.at(0);

        if (startGameEvent?.event !== GameSessionEvent.GameStart) {
            return null;
        }

        return startGameEvent.response as GameInfo;
    }

    private createReplayEventEntity(event: ReplayEventDto): ReplayEventEntity {
        const entity = new ReplayEventEntity();

        entity.userId = event.userId;
        entity.time = event.time;
        entity.event = event.event;
        entity.body = event.body;
        entity.response = event.response;

        return entity;
    }
}
