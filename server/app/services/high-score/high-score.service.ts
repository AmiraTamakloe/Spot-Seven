import { defaultDuelHighScores, defaultSoloHighScores } from '@app/constants/configuration.constants';
import { DuelHighScore } from '@app/model/database/duel-highscore.entity';
import { SoloHighScore } from '@app/model/database/solo-highscore.entity';
import { HighScore } from '@common/model/high-score';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class HighScoreService {
    constructor(
        @InjectRepository(SoloHighScore) private soloHighScoreRepository: Repository<SoloHighScore>,
        @InjectRepository(DuelHighScore) private duelHighScoreRepository: Repository<DuelHighScore>,
    ) {}

    async createDefaultSoloHighScores(): Promise<SoloHighScore[]> {
        const defaultSoloHighScore = defaultSoloHighScores;

        return Promise.all(
            defaultSoloHighScore.map(async (highScore: HighScore) => {
                return this.createSoloHighScore(highScore);
            }),
        );
    }

    async createDefaultDuelHighScores(): Promise<DuelHighScore[]> {
        const defaultDuelHighScore = defaultDuelHighScores;

        return Promise.all(
            defaultDuelHighScore.map(async (highScore: HighScore) => {
                return this.createDuelHighScore(highScore);
            }),
        );
    }

    async createSoloHighScore(highScore: HighScore): Promise<SoloHighScore> {
        return this.soloHighScoreRepository.create({
            playerName: highScore.playerName,
            time: highScore.time,
        });
    }

    async createDuelHighScore(highScore: HighScore): Promise<DuelHighScore> {
        return this.duelHighScoreRepository.create({
            playerName: highScore.playerName,
            time: highScore.time,
        });
    }

    async deleteGameHighScores(gameId: string): Promise<void> {
        await this.soloHighScoreRepository.createQueryBuilder().delete().where('game_id = :id', { id: gameId }).execute();
        await this.duelHighScoreRepository.createQueryBuilder().delete().where('game_id = :id', { id: gameId }).execute();
    }

    async deleteAllHighScores(): Promise<void> {
        await this.soloHighScoreRepository.clear();
        await this.duelHighScoreRepository.clear();
    }
}
