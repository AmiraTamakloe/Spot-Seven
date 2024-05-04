import { HighScore as HighScoreInterface } from '@common/model/high-score';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export abstract class HighScore implements HighScoreInterface {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    playerName!: string;

    @Column()
    time!: number;
}
