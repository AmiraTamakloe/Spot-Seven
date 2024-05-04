export enum GameMode {
    Classic = 'classic',
    ClassicTeam = 'classicTeam',
    TimeLimited = 'timeLimited',
    TimeLimitedImproved = 'timeLimitedImproved',
}

export function stringToGameMode(modeString: string): GameMode {
    switch (modeString) {
        case GameMode.Classic:
        case GameMode.ClassicTeam:
        case GameMode.TimeLimited:
        case GameMode.TimeLimitedImproved:
            return modeString as GameMode;
        default:
            throw new Error('Game Mode in URL invalid');
    }
}
