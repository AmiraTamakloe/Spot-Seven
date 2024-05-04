import { CreateTemporaryGameDto as CreateTemporaryGameInterface } from '@common/model/dto/create-temporary-game';
import { IsNumber, IsString } from 'class-validator';

export class CreateTemporaryGameDto implements CreateTemporaryGameInterface {
    @IsString()
    leftImage: string;

    @IsString()
    rightImage: string;

    @IsNumber()
    detectionRadius: number;

    constructor(leftImage: string, rightImage: string, detectionRadius: number) {
        this.leftImage = leftImage;
        this.rightImage = rightImage;
        this.detectionRadius = detectionRadius;
    }
}
