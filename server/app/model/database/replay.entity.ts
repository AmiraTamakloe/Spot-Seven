import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ReplayEventEntity } from './replay-event.entity';
import { User } from './user.entity';

@Entity()
export class Replay {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ nullable: false })
    sessionId!: string;

    @Column({ nullable: false })
    gameName!: string;

    @Column({ nullable: false, default: false })
    isPublic!: boolean;

    @ManyToOne(() => User, (user) => user.replays, { nullable: false, onDelete: 'CASCADE' })
    user!: User;

    @OneToMany(() => ReplayEventEntity, (replayEventEntity) => replayEventEntity.replay, { cascade: true })
    replayEvents!: ReplayEventEntity[];

    @Column({ nullable: false })
    originalImageFilename!: string;

    @Column({ nullable: false })
    modifiedImageFilename!: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(0)' })
    createdAt!: Date;
}
