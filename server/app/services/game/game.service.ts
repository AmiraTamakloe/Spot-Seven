import { ExistingGame, Game } from '@app/model/database/game.entity';
import { HighScore } from '@app/model/dto/high-score.dto';
import { PendingGame } from '@app/model/schema/pending-game';
import { BitmapService } from '@app/services/bitmap/bitmap.service';
import { DifferencesService } from '@app/services/differences/differences.service';
import { HighScoreService } from '@app/services/high-score/high-score.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, Subject } from 'rxjs';
import { Repository } from 'typeorm';
import { FileService } from '@app/services/file/file.service';
import { UPLOADS_PATH } from '@app/index.constants';

@Injectable()
export class GameService {
    private gameDeletedSubject: Subject<string>;
    private pendingGames: Map<string, PendingGame>;

    // eslint-disable-next-line max-params
    constructor(
        @InjectRepository(Game) private gameRepository: Repository<Game>,
        private bitmapService: BitmapService,
        private differencesService: DifferencesService,
        private highScoreService: HighScoreService,
        private fileService: FileService,
    ) {
        this.pendingGames = new Map<string, PendingGame>();
        this.gameDeletedSubject = new Subject();
    }

    get gameDeletedObservable(): Observable<string> {
        return this.gameDeletedSubject.asObservable();
    }

    getTemporaryGame(id: string): PendingGame | undefined {
        return this.pendingGames.get(id);
    }

    createTemporaryGame(id: string, pendingGame: PendingGame): void {
        this.pendingGames.set(id, pendingGame);
    }

    deleteTemporaryGame(id: string): void {
        this.pendingGames.delete(id);
    }

    async getGames(): Promise<ExistingGame[]> {
        return await this.gameRepository.find({ relations: { soloHighScores: true, duelHighScores: true } });
    }

    async getGame(id: string): Promise<ExistingGame | null> {
        return await this.gameRepository.findOne({
            where: {
                _id: id,
            },
            relations: { soloHighScores: true, duelHighScores: true },
        });
    }

    async deleteAllGames(): Promise<void> {
        await this.highScoreService.deleteAllHighScores();
        await this.gameRepository.delete({});
    }

    async createGame(pendingGame: PendingGame, name: string): Promise<ExistingGame> {
        const originalImageFilename = await this.bitmapService.saveImage(pendingGame.originalImageBase64);
        const modifiedImageFilename = await this.bitmapService.saveImage(pendingGame.modifiedImageBase64);
        const differencesFilename = await this.differencesService.saveDifferences(pendingGame.differences);

        return await this.gameRepository.save(
            this.gameRepository.create({
                name,
                originalImageFilename,
                modifiedImageFilename,
                differencesFilename,
                differencesCount: pendingGame.differences.length,
                difficulty: pendingGame.temporaryGame.difficulty,
                soloHighScores: await this.highScoreService.createDefaultSoloHighScores(),
                duelHighScores: await this.highScoreService.createDefaultDuelHighScores(),
            }),
        );
    }

    async deleteGame(id: string): Promise<void> {
        const game = await this.getGame(id);
        if (game === null) throw new HttpException('Game not found', HttpStatus.NOT_FOUND);

        this.gameDeletedSubject.next(id);

        await this.bitmapService.deleteImageFile(game.originalImageFilename);
        await this.bitmapService.deleteImageFile(game.modifiedImageFilename);
        await this.differencesService.deleteDifferences(game.differencesFilename);

        await this.highScoreService.deleteGameHighScores(id);
        await this.gameRepository.createQueryBuilder().delete().where('_id = :id', { id }).execute();
    }

    async updateGame(id: string, isMultiplayer: boolean, highScores: HighScore[]): Promise<void> {
        // FIXME: Fix other highScore being kept in the DB when new ones are added for a game
        const game = await this.getGame(id);
        if (isMultiplayer) await this.gameRepository.save({ ...game, duelHighScores: highScores });
        else await this.gameRepository.save({ ...game, soloHighScores: highScores });
    }

    // TODO: wrap into return object
    async generateGameWithXDifferences(game: Game, originalDifferences: Set<string>[], numberOfDifferences: number) {
        const originalImage = await this.fileService.loadFileContent(`${UPLOADS_PATH}/${game.originalImageFilename}`);
        const modifiedImage = await this.fileService.loadFileContent(`${UPLOADS_PATH}/${game.modifiedImageFilename}`);
        const { leftImage, rightImage } = await this.bitmapService.decodeImages(originalImage.toString('base64'), modifiedImage.toString('base64'));

        const { modifiedImageFilename, differencesFilename, differencesKeptIndexes } = await this.differencesService.keepXDifferences(
            leftImage,
            rightImage,
            originalDifferences,
            numberOfDifferences,
        );
        const newGame = this.gameRepository.create({
            _id: game._id,
            name: game.name,
            originalImageFilename: game.originalImageFilename,
            modifiedImageFilename,
            differencesFilename,
            differencesCount: numberOfDifferences,
            difficulty: game.difficulty,
            soloHighScores: game.soloHighScores,
            duelHighScores: game.duelHighScores,
        });
        return { newGame, differencesKeptIndexes };
    }
}
