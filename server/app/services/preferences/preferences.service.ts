import { MUSIC_PATH } from '@app/index.constants';
import { Preferences } from '@app/model/database/preferences.entity';
import { Music } from '@app/model/dto/music.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';

@Injectable()
export class PreferencesService {
    constructor(@InjectRepository(Preferences) private preferencesRepository: Repository<Preferences>) {}

    async createPreferences(userId: string): Promise<Preferences> {
        return await this.preferencesRepository.save(this.preferencesRepository.create({ userId }));
    }

    async uptadeLanguagePreferences(userId: string, language: string) {
        let foundPreferences;
        foundPreferences = await this.preferencesRepository.findOne({ where: { userId } });

        if (!foundPreferences) {
            foundPreferences = await this.preferencesRepository.save(this.preferencesRepository.create({ userId }));
        }
        foundPreferences.language = language;
        return await this.preferencesRepository.save(foundPreferences);
    }

    async uptadeThemePreferences(userId: string, theme: string) {
        let foundPreferences;
        foundPreferences = await this.preferencesRepository.findOne({ where: { userId } });

        if (!foundPreferences) {
            foundPreferences = await this.preferencesRepository.save(this.preferencesRepository.create({ userId }));
        }
        foundPreferences.theme = theme;
        return await this.preferencesRepository.save(foundPreferences);
    }

    async updateMusicPreferences(userId: string, music: string) {
        let foundPreferences;
        foundPreferences = await this.preferencesRepository.findOne({ where: { userId } });

        if (!foundPreferences) {
            foundPreferences = await this.preferencesRepository.save(this.preferencesRepository.create({ userId }));
        }

        foundPreferences.music = music;
        return await this.preferencesRepository.save(foundPreferences);
    }

    async getPreferences(userId: string): Promise<Preferences | null> {
        let foundPreferences;
        foundPreferences = await this.preferencesRepository.findOne({ where: { userId } });
        if (!foundPreferences) {
            foundPreferences = await this.createPreferences(userId);
        }
        return foundPreferences;
    }

    async saveMusic(upload: Music): Promise<string> {
        const musicBuffer = Buffer.from(upload.music, 'base64');
        const musicName = `music${upload.userId}.mp3`;
        const directory = join(MUSIC_PATH, musicName);
        try {
            await fs.writeFile(directory, musicBuffer);
            return musicName;
        } catch (error) {
            throw new Error('Error saving music');
        }
    }

    async getMusic(userId: string) {
        const musicName = `music${userId}.mp3`;
        const directory = join(MUSIC_PATH, musicName);
        try {
            const musicBuffer = await fs.readFile(directory);
            const base64Music = musicBuffer.toString('base64');
            return base64Music;
        } catch (error) {
            throw new Error('Error getting music URL');
        }
    }
}
