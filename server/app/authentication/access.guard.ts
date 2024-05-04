import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { CommunicationProtocol } from '@common/model/communication-protocole';
import { TokenType } from '@common/model/dto/jwt-tokens.dto';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AccessAuthGuard implements CanActivate {
    constructor(private authenticationService: AuthenticationService) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();

        if (!request.headers.authorization) {
            throw new HttpException('No token given', HttpStatus.BAD_REQUEST);
        }

        const token = request.headers.authorization.split(' ')[1];

        return this.authenticationService.validateJwtToken(token, TokenType.ACCESS, CommunicationProtocol.HTTP);
    }
}
