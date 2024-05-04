// Used to spy on the private attributes
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AccountService } from '@app/services/account/account.service';
import { TokenService } from '@app/services/token/token.service';
import { GameSessionEvent } from '@common/model/events/game-session.events';
import { Socket } from 'socket.io-client';
import { SocketService } from './socket.service';

import SpyObj = jasmine.SpyObj;

describe('SocketService', () => {
    let service: SocketService;
    let socketSpy: SpyObj<Socket>;
    let accountServiceSpy: SpyObj<AccountService>;
    let tokenServiceSpy: SpyObj<TokenService>;

    beforeEach(() => {
        accountServiceSpy = jasmine.createSpyObj(AccountService, ['getUser']);
        tokenServiceSpy = jasmine.createSpyObj(TokenService, ['getRefreshToken', 'getTokens', 'getUsername']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                SocketService,
                { provide: AccountService, useValue: accountServiceSpy },
                { provide: TokenService, useValue: tokenServiceSpy },
            ],
        });

        socketSpy = jasmine.createSpyObj(Socket, ['disconnect', 'emit', 'on', 'once']);

        socketSpy.disconnect.and.callFake(() => {
            return socketSpy;
        });

        service = TestBed.inject(SocketService);

        service.socket = socketSpy;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('send should call socket.emit', () => {
        socketSpy.emit.and.callFake((event, data, callback) => {
            expect(event).toEqual(GameSessionEvent.GameStart);
            expect(data).toEqual({ name: 'test' });
            callback();
            return {} as Socket;
        });
        service.send(GameSessionEvent.GameStart, { name: 'test' });
        expect(socketSpy.emit).toHaveBeenCalled();

        const myCallback = jasmine.createSpy();
        service.send(GameSessionEvent.GameStart, { name: 'test' }, myCallback);
        expect(myCallback).toHaveBeenCalled();
    });

    it('on should call socket.on', () => {
        const callback = () => {
            return;
        };

        service.on(GameSessionEvent.DifferenceFound, callback);
        expect(socketSpy.on).toHaveBeenCalledWith(GameSessionEvent.DifferenceFound, callback);
    });

    it('once should call socket.once', () => {
        const callback = () => {
            return;
        };

        service.once(GameSessionEvent.EndGame, callback);
        expect(socketSpy.once).toHaveBeenCalledWith(GameSessionEvent.EndGame, callback);
    });

    it('isSocketAlive should return true if the socket is alive', () => {
        socketSpy.connected = true;
        expect(service.isSocketAlive()).toEqual(true);
    });

    it('isSocketAlive should return false if there is no socket', () => {
        service['socket'] = null as any;
        expect(service.isSocketAlive()).toBeFalsy();
    });

    it('isSocketAlive should return false if the socket is not connected', () => {
        socketSpy.connected = false;
        expect(service.isSocketAlive()).toBeFalsy();
    });
});
