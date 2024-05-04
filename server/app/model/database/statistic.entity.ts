import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Statistic {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ nullable: false })
    userId!: string;

    @Column({ nullable: false })
    duration!: number;

    @Column({ nullable: false })
    isWin!: boolean;

    @Column({ nullable: false })
    score!: number;
}
