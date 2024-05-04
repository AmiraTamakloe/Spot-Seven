import { Language, Music, Theme } from '@app/enums/preferences';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Preferences {
    @PrimaryGeneratedColumn('uuid')
    _id!: string;

    @Column({ nullable: false })
    userId!: string;

    @Column({ nullable: true, default: Language.French })
    language?: string;

    @Column({ nullable: true, default: Theme.Light })
    theme?: string;

    @Column({ nullable: true, default: Music.GoodResult })
    music?: string;
}
