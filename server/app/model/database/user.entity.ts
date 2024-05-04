import { Column, Entity, OneToMany, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Friendship } from './friendship.entity';
import { Replay } from './replay.entity';
import { ChatMessage } from './chat-message.entity';
import { Chat } from './chat.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    _id!: string;

    @Column({ nullable: false, unique: true })
    username!: string;

    @Column({ nullable: true })
    saltedHashedPassword!: string;

    @Column({ nullable: false })
    email!: string;

    @Column({ nullable: false, default: 'avatar1.png' })
    avatar!: string;

    @OneToMany(() => Friendship, (friendship) => friendship.sender)
    sentFriendRequests!: Friendship[];

    @OneToMany(() => Friendship, (friendship) => friendship.receiver)
    receivedFriendRequests!: Friendship[];

    @OneToMany(() => Friendship, (friendship) => friendship.receiver)
    friends!: Friendship[];

    @OneToMany(() => Replay, (replay) => replay.user, { cascade: true, nullable: true })
    replays!: Replay[];

    @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.author)
    messages!: ChatMessage[];

    @ManyToMany(() => Chat, (chat) => chat.users)
    chats!: Chat[];

    @OneToMany(() => Chat, (chat) => chat.owner)
    ownedChats!: Chat[];
}
