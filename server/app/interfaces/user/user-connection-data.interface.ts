import { JwtTokensDto } from '@common/model/dto/jwt-tokens.dto';

export interface UserConnectionData {
    socket: string;
    token: JwtTokensDto;
}
