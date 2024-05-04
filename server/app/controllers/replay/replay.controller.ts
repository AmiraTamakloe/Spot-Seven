import { AccessAuthGuard } from '@app/authentication/access.guard';
import { ReplayService } from '@app/services/replay/replay.service';
import { ReplayDto } from '@common/model/dto/replay';
import { ReplayEventDto } from '@common/model/events/replay.events';
import { RawPayload } from '@common/tokens';
import { Controller, Delete, Get, Headers, HttpCode, HttpException, HttpStatus, Logger, Param, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Replays')
@Controller('replays')
@ApiBearerAuth('access-token')
@UseGuards(AccessAuthGuard)
export class ReplayController {
    private readonly logger = new Logger(ReplayController.name);

    constructor(private readonly replayService: ReplayService, private jwtService: JwtService) {}

    @ApiOperation({ summary: 'Get a replay after a game' })
    @Get('/gameReplay')
    getTemporaryReplay(@Headers('authorization') authHeader: string): ReplayEventDto[] {
        const userId = this.getUsernameFromAuthHeader(authHeader);

        if (userId === undefined) {
            return [];
        }

        return this.replayService.createReplayForUser(userId);
    }

    @ApiOperation({ summary: 'Save a replay after a game' })
    @Post('/gameReplay')
    saveTemporaryReplay(@Headers('authorization') authHeader: string): void {
        const userId = this.getUsernameFromAuthHeader(authHeader);

        if (userId === undefined) {
            return;
        }

        try {
            this.replayService.persistReplayForPlayer(userId);
        } catch (error) {
            this.logger.error(`Error saving replay for user ${userId}: ${error}`);
            throw new HttpException('Error saving replay', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: 'Delete a replay after a game' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete('/gameReplay')
    deleteTemporaryReplay(@Headers('authorization') authHeader: string): void {
        const userId = this.getUsernameFromAuthHeader(authHeader);

        if (userId === undefined) {
            return;
        }

        this.replayService.deleteReplayForUser(userId);

        return;
    }

    @ApiOperation({ summary: "Get the user's replays" })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No replays found' })
    @Get('/')
    async getUserReplays(@Headers('authorization') authHeader: string, @Res({ passthrough: true }) response: Response): Promise<ReplayDto[]> {
        const userId = this.getUsernameFromAuthHeader(authHeader);

        if (userId === undefined) {
            response.status(HttpStatus.NO_CONTENT).json([]);
            return [];
        }

        const replays = await this.replayService.getUserReplays(userId);

        if (replays.length === 0) {
            response.status(HttpStatus.NO_CONTENT).json([]);
            return [];
        }

        return replays;
    }

    @ApiOperation({ summary: 'Get all replays' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No replays found' })
    @Get('/all')
    async getAllReplays(@Res() response: Response): Promise<ReplayDto[]> {
        const replays = await this.replayService.getAllReplays();

        if (replays.length === 0) {
            response.status(HttpStatus.NO_CONTENT).json([]);
            return [];
        }

        response.status(HttpStatus.OK).json(replays);
        return replays;
    }

    // FIXME: Some of the routes throw errors because the headers are modified after send
    //  Solution is probably to remove passthrough from the response object and send manually
    @ApiOperation({ summary: 'Get specific replay' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Replay not found' })
    @Get('/:id')
    async getReplay(@Res({ passthrough: true }) response: Response, @Param('id') id: string): Promise<ReplayEventDto[] | void> {
        const replay = await this.replayService.getReplay(id);

        if (!replay) {
            response.status(HttpStatus.NOT_FOUND).send();
            return;
        }

        return replay;
    }

    @ApiOperation({ summary: 'Toggle replay visibility' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Replay visibility was toggled' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Replay not found' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'User is not allowed to modify the visibility' })
    @Patch('/:id')
    async toggleReplayVisibility(
        @Headers('authorization') authHeader: string,
        @Res({ passthrough: true }) response: Response,
        @Param('id') id: string,
    ): Promise<void> {
        const userId = this.getUsernameFromAuthHeader(authHeader);

        if (userId === undefined) {
            response.status(HttpStatus.FORBIDDEN).send();
            return;
        }

        const status = await this.replayService.toggleReplayVisibility(id, userId);
        response.status(status).send();
        return;
    }

    @ApiOperation({ summary: 'Delete saved replay' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Replay was deleted' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'User is not allowed to delete the replay' })
    @Delete('/:id')
    async deleteReplay(
        @Headers('authorization') authHeader: string,
        @Res({ passthrough: true }) response: Response,
        @Param('id') id: string,
    ): Promise<void> {
        const userId = this.getUsernameFromAuthHeader(authHeader);

        if (userId === undefined) {
            response.status(HttpStatus.FORBIDDEN).send();
            return;
        }

        await this.replayService.deleteSavedReplay(id, userId);
        response.status(HttpStatus.NO_CONTENT).send();
        return;
    }

    private getUsernameFromAuthHeader(auth: string): string {
        // We know this is always a string, since these routes are protected by the access guard
        const token = auth.split(' ')[1] as string;

        return this.jwtService.decode<RawPayload>(token).username;
    }
}
