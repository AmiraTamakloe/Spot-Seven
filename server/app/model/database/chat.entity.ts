import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { ChatMessage } from './chat-message.entity';

@Entity()
export class Chat {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @ManyToMany(() => User, (user) => user.chats)
    @JoinTable()
    users!: User[];

    @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.chat, { cascade: true })
    chatMessages!: ChatMessage[];

    @ManyToOne(() => User, (user) => user.ownedChats)
    owner!: User;

    @Column({ default: true })
    isQuittable!: boolean;

    @Column({ default: false })
    isGameChat!: boolean;
}
