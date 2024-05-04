import { ReplayEvent, ReplayEventBody, ReplayEventDto, ReplayEventResponse } from '@common/model/events/replay.events';
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Replay } from './replay.entity';
import { bigIntTransformer } from './transformers/bigint.transformer';
import { buildJsonTransformer } from './transformers/json.transformer';

@Entity()
export class ReplayEventEntity implements ReplayEventDto {
    @PrimaryGeneratedColumn('uuid')
    @Exclude()
    @ApiHideProperty()
    _id!: string;

    @Column({ nullable: false })
    userId!: string;

    @Column('bigint', { transformer: bigIntTransformer, nullable: false })
    time!: number;

    @Column('json', { transformer: buildJsonTransformer<ReplayEvent>(), nullable: false })
    event!: ReplayEvent;

    @Column('json', { transformer: buildJsonTransformer<ReplayEventBody>(), nullable: true })
    body!: ReplayEventBody;

    @Column('json', { transformer: buildJsonTransformer<ReplayEventResponse>(), nullable: true })
    response!: ReplayEventResponse;

    @ManyToOne(() => Replay, (replay) => replay.replayEvents, { nullable: false, onDelete: 'CASCADE' })
    replay!: Replay;
}
