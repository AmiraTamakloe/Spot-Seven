import { Entity, ManyToOne } from 'typeorm';
import { Game } from './game.entity';
import { HighScore } from './highscore.entity';

@Entity()
export class SoloHighScore extends HighScore {
    @ManyToOne(() => Game, (game) => game.soloHighScores, { onDelete: 'CASCADE' })
    game!: Game;
}
