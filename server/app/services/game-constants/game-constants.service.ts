import { GameConstantEntity } from '@app/model/database/game-constant.entity';
import { ConstantName, GameConstants } from '@common/game-constants';
import { defaultGameConstants } from '@common/game-default.constants';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class GameConstantsService {
    constructor(
        @InjectRepository(GameConstantEntity)
        private readonly gameConstantsRepository: Repository<GameConstantEntity>,
    ) {
        this.gameConstantsRepository
            .createQueryBuilder()
            .select('game_constant_entity')
            .getCount()
            .then((count) => {
                if (count === 0) {
                    this.resetToDefault();
                }
            });
    }

    async getAll(): Promise<GameConstants> {
        const constants: Partial<GameConstants> = {};

        for (const constantName of Object.keys(defaultGameConstants)) {
            constants[constantName as ConstantName] = (
                await this.gameConstantsRepository.findOneByOrFail({
                    name: constantName,
                })
            ).value;
        }

        return constants as GameConstants;
    }

    async update(constant: ConstantName, value: number): Promise<number> {
        await this.gameConstantsRepository.update({ name: constant }, { value });

        return value;
    }

    async resetToDefault(): Promise<GameConstants> {
        const defaultConstants = defaultGameConstants;

        await this.gameConstantsRepository.clear();

        for (const [constantName, value] of Object.entries(defaultConstants)) {
            await this.gameConstantsRepository.save(
                this.gameConstantsRepository.create({
                    name: constantName,
                    value,
                }),
            );
        }

        return defaultConstants;
    }
}
