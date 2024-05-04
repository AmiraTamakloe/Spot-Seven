import { Injectable, ValidationError, ValidationPipe } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WSValidationPipe extends ValidationPipe {
    createExceptionFactory() {
        return (validationErrors: ValidationError[] | undefined = []) => {
            if (this.isDetailedOutputDisabled) {
                return new WsException('Bad request');
            }
            const errors = this.flattenValidationErrors(validationErrors);

            return new WsException(errors.toString());
        };
    }
}
