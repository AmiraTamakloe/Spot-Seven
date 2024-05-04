/* eslint-disable max-params */
import { Statistic } from '@app/model/database/statistic.entity';
import { StatisticDto } from '@app/model/dto/statistic';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '@app/services/user/user.service';
import { SECONDS_IN_MINUTE } from './statistics.constants';

@Injectable()
export class StatisticService {
    constructor(@InjectRepository(Statistic) private statisticRepository: Repository<Statistic>, private userService: UserService) {}

    async createStatisticEntry(username: string, duration: number, isWin: boolean, score: number): Promise<Statistic | undefined> {
        try {
            const user = await this.userService.getUser(username);
            const userId = user?._id;
            return this.statisticRepository.save({ userId, duration, isWin, score });
        } catch (error) {
            Logger.error(error);
        }
    }

    async getNumberOfGamesPlayed(userId: string): Promise<number> {
        return this.statisticRepository.count({ where: { userId } });
    }

    async getNumberOfGamesWon(userId: string): Promise<number> {
        return this.statisticRepository.count({ where: { userId, isWin: true } });
    }

    async getAverageScore(userId: string): Promise<number> {
        const scores = await this.statisticRepository.find({ where: { userId }, select: ['score'] });
        const sum = scores.reduce((acc, curr) => acc + curr.score, 0);
        const averageScore = sum > 0 ? Math.round(sum / scores.length) : 0;
        return averageScore;
    }

    async getAverageTime(userId: string): Promise<string> {
        const durations = await this.statisticRepository.find({ where: { userId }, select: ['duration'] });
        const sum = durations.reduce((acc, curr) => acc + Number(curr.duration), 0);
        const roundedSum = Math.round(sum / durations.length);
        return sum > 0 ? this.transformSecondsToMinutesAndSeconds(roundedSum) : '0:0';
    }

    async getStatistics(userId: string): Promise<StatisticDto> {
        const gamesPlayed = await this.getNumberOfGamesPlayed(userId);
        const gamesWon = await this.getNumberOfGamesWon(userId);
        const averageScore = await this.getAverageScore(userId);
        const averageTime = await this.getAverageTime(userId);
        return { gamesPlayed, gamesWon, averageScore, averageTime } as StatisticDto;
    }

    transformSecondsToMinutesAndSeconds(seconds: number): string {
        const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
        const remainingSeconds = seconds % SECONDS_IN_MINUTE;
        return `${minutes}:${remainingSeconds}`;
    }
}
