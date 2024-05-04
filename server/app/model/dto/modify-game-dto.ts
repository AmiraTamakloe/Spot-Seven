import { ApiProperty } from '@nestjs/swagger';

export class ModifyGameDto {
    @ApiProperty()
    gameId: string;

    constructor(gameId: string) {
        this.gameId = gameId;
    }
}
