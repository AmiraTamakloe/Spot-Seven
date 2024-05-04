import { WsException } from '@nestjs/websockets';
import { WSValidationPipe } from './web-socket.validation-pipe';

describe('WSValidationPipe', () => {
    let validationPipe: WSValidationPipe;

    beforeEach(async () => {
        validationPipe = new WSValidationPipe();
    });

    it('createExceptionFactory() should return a function that throws a WsException', () => {
        const exceptionFactory = validationPipe.createExceptionFactory();
        expect(exceptionFactory()).toBeInstanceOf(WsException);
    });

    it('exception factory should throw generic message if detailed output is disabled', () => {
        validationPipe['isDetailedOutputDisabled'] = true;
        const exceptionFactory = validationPipe.createExceptionFactory();
        const exception = exceptionFactory();
        expect(() => {
            throw exception;
        }).toThrow('Bad request');
    });
});
