import { Timer } from './timer';

describe('Timer', () => {
    let timer: Timer;
    const roomId = 'room';
    const startTime = 0;

    beforeEach(() => {
        timer = new Timer(roomId, startTime);
    });

    it('should be defined', () => {
        expect(timer).toBeDefined();
    });
});
