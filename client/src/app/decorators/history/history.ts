type HistoryEntry<T extends string> = (self: HistoryEnabled<T>) => void;

export type HistoryEntryOf<T> = HistoryEntry<MethodsOf<T>>;

type HistoryEnabled<T extends string> = {
    addToHistory: (entry: HistoryEntry<T>) => void;
    clearHistory: () => void;
    // We need Function to allow a method that takes any kind of arguments
    // eslint-disable-next-line @typescript-eslint/ban-types
} & { [K in T]: Function };

// Inspired from https://stackoverflow.com/a/57386444
type IncludeMatchingProperties<T, V> = Pick<T, { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T]>;

// We need Function to allow a method that takes any kind of arguments
// eslint-disable-next-line @typescript-eslint/ban-types
type MethodsOf<T> = keyof IncludeMatchingProperties<T, Function> & string;

export type HistoryEnabledOf<T> = HistoryEnabled<MethodsOf<T>>;

export interface TimedHistoryEntry<T> {
    action: HistoryEntryOf<T>;
    time: number;
}

// Decorators should be UpperCamelCase
// eslint-disable-next-line @typescript-eslint/naming-convention
export const History = (clear: boolean = false) => {
    return <T extends string>(target: HistoryEnabled<T>, propertyKey: T, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;

        descriptor.value = function (this: HistoryEnabled<T>, ...args: unknown[]) {
            if (clear) this.clearHistory();

            // eslint-disable-next-line prefer-spread
            this.addToHistory((self: HistoryEnabled<T>) => self[propertyKey].apply(self, args));

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
};
