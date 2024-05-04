import { CreateGameDto as CreateGameInterface } from '@common/model/dto/create-game';
import { IsString } from 'class-validator';

export class CreateGameDto implements CreateGameInterface {
    @IsString()
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}
