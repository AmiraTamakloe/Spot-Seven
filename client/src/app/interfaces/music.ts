import { MusicNames } from '@app/enums/preferences';

export interface MusicOption {
    music: MusicNames;
    icon: string;
    label: string;
}

export interface MusicData {
    userId: string;
    selectedMusic: string;
    musicOptions: MusicOption[];
}
