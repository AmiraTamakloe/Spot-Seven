import { GameSession } from '@app/model/schema/game-session';
import { Position } from '@common/model/message';
import { Test, TestingModule } from '@nestjs/testing';
import { MessageFormatterService } from './message-formatter.service';

describe('MessageFormatterService', () => {
    let service: MessageFormatterService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MessageFormatterService],
        }).compile();

        service = module.get<MessageFormatterService>(MessageFormatterService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('createDifferenceFoundMessage() should return a difference found message', () => {
        let message = service.createDifferenceFoundMessage();
        expect(message.content).toEqual('Différence trouvée.');
        message = service.createDifferenceFoundMessage('John');
        expect(message.content).toEqual('Différence trouvée par John.');
    });

    it('createErrorMessage() should return an error message', () => {
        let message = service.createErrorMessage();
        expect(message.content).toEqual('Erreur.');
        message = service.createErrorMessage('John');
        expect(message.content).toEqual('Erreur par John.');
    });

    it('createGiveUpMessage() should return a give up message', () => {
        const message = service.createGiveUpMessage('John');
        expect(message.content).toEqual('John a abandonné la partie.');
    });

    it('createUsedHintMessage() should return a used hint message', () => {
        const message = service.createUsedHintMessage();
        expect(message.content).toEqual('Indice Utilisé.');
    });

    it('createRecordBeatenMessage() should return a record beaten message', () => {
        const message = service.createRecordBeatenMessage('John', Position.First, {
            game: {
                name: 'game',
            },
            isMultiplayer: () => false,
        } as GameSession);
        expect(message.content).toEqual('John obtient la première place dans les meilleurs temps du jeu "game" en solo!');

        const message2 = service.createRecordBeatenMessage('John', Position.Second, {
            game: {
                name: 'game',
            },
            isMultiplayer: () => true,
        } as GameSession);
        expect(message2.content).toEqual('John obtient la deuxième place dans les meilleurs temps du jeu "game" en un contre un!');
    });
});
