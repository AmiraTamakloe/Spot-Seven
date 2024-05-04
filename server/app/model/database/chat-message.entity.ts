import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Chat } from './chat.entity';

@Entity()
export class ChatMessage {
    @PrimaryGeneratedColumn('uuid')
    messageId!: string;

    @ManyToOne(() => Chat, (chat) => chat.chatMessages, { onDelete: 'CASCADE' })
    chat!: Chat;

    @ManyToOne(() => User, (user) => user.messages)
    author!: User;

    @Column({ nullable: false })
    message!: string;

    @Column({ nullable: false })
    timestamp!: string;
}
