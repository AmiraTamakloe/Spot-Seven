export class StrictMap<KeyType, ValueType> {
    map: Map<KeyType, ValueType>;

    constructor() {
        this.map = new Map<KeyType, ValueType>();
    }

    get(key: KeyType): ValueType {
        const result = this.map.get(key);
        if (result === undefined) {
            throw new Error('Item not found');
        }
        return result;
    }

    set(key: KeyType, value: ValueType) {
        this.map.set(key, value);
    }
}
