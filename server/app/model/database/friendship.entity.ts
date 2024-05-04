import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { FriendshipStatus } from '@app/enums/friendship-status.entity';

@Entity()
export class Friendship {
    @PrimaryGeneratedColumn('uuid')
    _id!: string;

    @ManyToOne(() => User, (user) => user.sentFriendRequests)
    sender!: User;

    @ManyToOne(() => User, (user) => user.receivedFriendRequests)
    receiver!: User;

    @Column({ nullable: true, type: 'text' })
    blockedUser!: string | undefined;

    @Column()
    status!: FriendshipStatus;
}
