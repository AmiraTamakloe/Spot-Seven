import { LogoutDto as LogoutDtoInterface } from '@common/model/dto/logout.dto';

export class LogoutDto implements LogoutDtoInterface {
    username: string;

    constructor(username: string) {
        this.username = username;
    }
}
