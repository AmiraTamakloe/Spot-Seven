import { AccessAuthGuard } from '@app/authentication/access.guard';
import { Preferences } from '@app/model/database/preferences.entity';
import { Music } from '@app/model/dto/music.dto';
import { PreferencesDto } from '@app/model/dto/preferences.dto';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import { Body, ClassSerializerInterceptor, Controller, Get, Param, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@UseGuards(AccessAuthGuard)
@ApiTags('Account Preferences')
@ApiBearerAuth('access-token')
@Controller('preferences')
export class PreferencesController {
    constructor(private readonly preferencesService: PreferencesService) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({ summary: 'Get user preferences' })
    @Get('/:userId')
    async findPreferences(@Param('userId') userId: string): Promise<Preferences | null> {
        return await this.preferencesService.getPreferences(userId);
    }

    @ApiOperation({ summary: 'Update user preferences language value' })
    @Put('/language')
    async updateLanguagePreferences(@Body() preferencesDto: PreferencesDto): Promise<Preferences | null> {
        return await this.preferencesService.uptadeLanguagePreferences(preferencesDto.userId, preferencesDto.language);
    }

    @ApiOperation({ summary: 'Update user preferences theme value' })
    @Put('/theme')
    async updateThemePreferences(@Body() preferencesDto: PreferencesDto): Promise<Preferences | null> {
        return await this.preferencesService.uptadeThemePreferences(preferencesDto.userId, preferencesDto.theme);
    }
    @ApiOperation({ summary: 'Update user preferences music value' })
    @Put('/music')
    async updateMusicPreferences(@Body() preferencesDto: PreferencesDto): Promise<Preferences | null> {
        return await this.preferencesService.updateMusicPreferences(preferencesDto.userId, preferencesDto.music);
    }
    @ApiOperation({ summary: 'Get user preferences' })
    @Get('/:userId/music')
    async getMusic(@Param('userId') userId: string): Promise<string | null> {
        return await this.preferencesService.getMusic(userId);
    }
    @ApiOperation({ summary: 'Update user uploaded music value' })
    @Put('/music/uploaded')
    async saveMusic(@Body() music: Music) {
        await this.preferencesService.saveMusic(music);
    }
}
