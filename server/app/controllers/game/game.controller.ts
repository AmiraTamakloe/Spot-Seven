import { AccessAuthGuard } from '@app/authentication/access.guard';
import { ExistingGame } from '@app/model/database/game.entity';
import { GameService } from '@app/services/game/game.service';
import { ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, HttpStatus, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Games')
@Controller('game')
@ApiBearerAuth('access-token')
@UseGuards(AccessAuthGuard)
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({ summary: 'Get all games' })
    @Get('/')
    async getGames(): Promise<ExistingGame[]> {
        return await this.gameService.getGames();
    }

    @ApiOperation({ summary: 'Delete a game' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete('/:id')
    async deleteGame(@Param('id') id: string): Promise<void> {
        await this.gameService.deleteGame(id);
    }

    @ApiOperation({ summary: 'Delete all game' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete()
    async deleteAllGame(): Promise<void> {
        await this.gameService.deleteAllGames();
    }
}
