export class PreferencesDto {
    userId: string;
    language: string;
    theme: string;
    music: string;

    // eslint-disable-next-line max-params
    constructor(userId: string, language: string, theme: string, music: string) {
        this.userId = userId;
        this.language = language;
        this.theme = theme;
        this.music = music;
    }
}
