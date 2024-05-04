import { ChatSessionEvent } from './chat-session.events';
import { ConfigurationEvent } from './configuration.events';
import { FriendshipEvent } from './friendship.events';
import { GameCreateEvent } from './game-create.events';
import { GameSessionEvent } from './game-session.events';
import { ObserverEvent } from './observer.events';
export enum GlobalEvent {
    Exception = 'exception',
}

export type SocketEvent = GameCreateEvent | GameSessionEvent | GlobalEvent | ConfigurationEvent | FriendshipEvent | ChatSessionEvent | ObserverEvent;
