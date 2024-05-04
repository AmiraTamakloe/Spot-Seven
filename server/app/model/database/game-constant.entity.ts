import { Exclude } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['name'])
@Unique('UQ_NAMES', ['name'])
export class GameConstantEntity {
    @Exclude()
    @PrimaryGeneratedColumn('uuid')
    // FIXME: Exclude from api
    id!: string;

    @Column()
    name!: string;

    @Column()
    value!: number;
}
