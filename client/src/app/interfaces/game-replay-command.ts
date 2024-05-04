export interface GameReplayCommand {
    time: number;
    action: () => void;
}
