import { User } from '@app/model/database/user.entity';
import { GoogleUserDto } from '@app/model/dto/google-user-dto';
import { LogoutDto } from '@app/model/dto/logout.dto';
import { UserDto } from '@app/model/dto/user-dto';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { UserService } from '@app/services/user/user.service';
import { JwtTokensDto } from '@common/model/dto/jwt-tokens.dto';
import { LoginDto } from '@common/model/dto/login.dto';
import { RefreshDto } from '@common/model/dto/refresh.dto';
import { Body, Controller, Get, HttpStatus, Logger, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentification')
@Controller('auth')
export class AuthenticationController {
    private logger = new Logger(AuthenticationController.name);

    constructor(private authenticationService: AuthenticationService, private userService: UserService) {}

    @Post('/login')
    @ApiOperation({ summary: 'Log into app' })
    @ApiOkResponse({ status: HttpStatus.OK, description: 'Okay to log into app' })
    @ApiForbiddenResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized to sign in to app' })
    @ApiBody({
        type: UserDto,
        description: 'User credentials to log into app',
        examples: {
            a: {
                summary: 'Example credentials',
                value: {
                    username: 'gary',
                    password: 'test',
                } as UserDto,
            },
        },
    })
    async logIn(@Body() signInDto: LoginDto): Promise<JwtTokensDto> {
        this.logger.log(`Logging in user ${signInDto.username}`);
        return await this.authenticationService.logIn(signInDto.username, signInDto.password);
    }

    @Post('/google')
    @ApiOperation({ summary: 'Log into app using Google' })
    @ApiOkResponse({ status: HttpStatus.OK, description: 'Okay to log into app' })
    @ApiForbiddenResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Google Authentification failed' })
    async googleLogIn(@Body() googleSignInDto: GoogleUserDto): Promise<JwtTokensDto> {
        return await this.authenticationService.logInGoogle(googleSignInDto);
    }

    @Post('/signup')
    @ApiOperation({ summary: 'Sign up to app' })
    @ApiBody({
        type: UserDto,
        description: 'User credentials to sign up to app',
        examples: {
            a: {
                summary: 'Example credentials',
                value: {
                    username: 'gary',
                    password: 'test',
                    email: 'gary.test@polymtl.ca',
                } as UserDto,
            },
        },
    })
    async signUp(@Body() userDto: UserDto) {
        return this.authenticationService.signUp(userDto);
    }

    @Post('/refresh')
    @ApiOperation({ summary: 'Refresh token' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Token refreshed' })
    @ApiForbiddenResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized to refresh token' })
    async refreshTokens(@Body() refreshDto: RefreshDto): Promise<JwtTokensDto> {
        return await this.authenticationService.refreshTokens(refreshDto.username, refreshDto.refreshToken);
    }

    @Post('/logout')
    @ApiOperation({ summary: 'Log out of app' })
    @ApiBody({
        type: LogoutDto,
        description: 'Username to logout of app',
        examples: {
            a: {
                summary: 'Example username',
                value: {
                    username: 'gary',
                },
            },
        },
    })
    async logOut(@Body() logoutDto: LogoutDto): Promise<void> {
        this.logger.log(`Signing out user ${logoutDto.username}`);
        return await this.authenticationService.logOut(logoutDto.username);
    }

    @ApiOperation({ summary: 'Get user information' })
    @Get('/:username')
    async getUsers(@Param('username') username: string): Promise<User | null> {
        return await this.userService.getUser(username);
    }

    @ApiOperation({ summary: 'Get user avatar' })
    @Get('/avatar/:imageName')
    async getAvatar(@Param('imageName') imageName: string): Promise<string> {
        return await this.userService.getAvatarUrl(imageName);
    }

    @ApiOperation({ summary: 'Update username and avatar' })
    @Put('/parameter')
    @ApiResponse({ status: HttpStatus.OK, description: 'Parameters where updated correctly' })
    @ApiForbiddenResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'The username already exists or an error occured trying to save your image',
    })
    async updateUserParameters(@Body() user: User) {
        return await this.userService.updateUserParameters(user);
    }
}
