import { History } from '@app/model/database/game-history.entity';
import { History as HistoryInterface } from '@common/model/history';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class GameHistoryService {
    constructor(@InjectRepository(History) private historyRepository: Repository<History>) {}

    async getHistory(): Promise<History[]> {
        return await this.historyRepository.find();
    }

    async deleteHistory(): Promise<void> {
        await this.historyRepository.clear();
    }

    async createGameHistory(history: HistoryInterface): Promise<void> {
        await this.historyRepository.save(this.historyRepository.create({ ...history }));
    }
}
