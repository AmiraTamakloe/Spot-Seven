import { HostListener, Injectable, OnDestroy } from '@angular/core';
import { TokenExpiredError } from '@app/services/token/token-expired-error';
import { TokenService } from '@app/services/token/token.service';
import { SocketEvent } from '@common/model/events/socket-event';
import { Tokens } from '@common/tokens';
import { BehaviorSubject, Observer, Subscription } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketService implements OnDestroy {
    socket: Socket | null = null;
    private socketCreatedSubject = new BehaviorSubject<boolean>(false);

    constructor(private readonly tokenService: TokenService) {}

    @HostListener('window:beforeunload')
    ngOnDestroy(): void {
        this.disconnect();
    }

    isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    async connect() {
        let tokens: Tokens;
        try {
            tokens = this.tokenService.getTokens();
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                await this.tokenService.refreshToken();
                tokens = this.tokenService.getTokens();
            } else {
                throw error;
            }
        }
        this.socket = io(environment.socketUrl, {
            query: {
                token: tokens.refreshToken,
                username: this.tokenService.getUsername(),
            },
        });

        this.socketCreatedSubject.next(true);
    }

    disconnect() {
        if (this.socket !== null) {
            this.socketCreatedSubject.next(false);
            this.socket.disconnect();
            this.socket = null;
        }
    }

    executeOnSocketCreation(action: Partial<Observer<boolean>>): Subscription {
        return this.socketCreatedSubject.subscribe(action);
    }

    // Based on https://gitlab.com/nikolayradoev/socket-io-exemple/-/blob/master/client/src/app/services/socket-client.service.ts
    on<T>(event: SocketEvent, action: (data: T) => void): void {
        if (this.socket !== null) this.socket.on(event, action);
    }

    off<T>(event: SocketEvent, action: (data: T) => void): void {
        if (this.socket !== null) this.socket.off(event, action);
    }

    once<T>(event: SocketEvent, action: (data: T) => void): void {
        if (this.socket !== null) this.socket.once(event, action);
    }

    // Based on https://gitlab.com/nikolayradoev/socket-io-exemple/-/blob/master/client/src/app/services/socket-client.service.ts
    send<T = unknown, U = unknown>(event: SocketEvent, data?: T, callback?: (data: U) => void): void {
        if (!callback) callback = () => undefined;
        if (this.socket !== null) this.socket.emit(event, data, callback);
    }
}
