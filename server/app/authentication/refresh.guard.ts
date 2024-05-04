import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { CommunicationProtocol } from '@common/model/communication-protocole';
import { TokenType } from '@common/model/dto/jwt-tokens.dto';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
// FIXME: This isn't use, but should guard /refresh
export class RefreshAuthGuard implements CanActivate {
    constructor(private authenticationService: AuthenticationService) {}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const refreshToken: string = request.Body.refreshToken;
        const username: string = request.Body.username;
        if (refreshToken === undefined || refreshToken === null) {
            throw new HttpException('No token given', HttpStatus.UNAUTHORIZED);
        }
        if (username === undefined || username === null) {
            throw new HttpException('No username given', HttpStatus.BAD_REQUEST);
        }

        return this.authenticationService.validateJwtToken(refreshToken, TokenType.REFRESH, CommunicationProtocol.HTTP);
    }
}
