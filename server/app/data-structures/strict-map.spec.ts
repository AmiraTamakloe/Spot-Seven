import { StrictMap } from './strict-map';

describe('StrictMap', () => {
    let strictMap: StrictMap<string, string>;

    beforeEach(async () => {
        strictMap = new StrictMap();
    });

    it('constructor should construct', () => {
        expect(strictMap).toBeTruthy();
    });

    it('get should return value or throw error', () => {
        strictMap.map.set('key', 'value');
        expect(strictMap.get('key')).toEqual('value');
        expect(() => strictMap.get('otherKey')).toThrow('Item not found');
    });
});
