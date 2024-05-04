// Based on https://stackoverflow.com/a/76048178

import { ValueTransformer } from 'typeorm';

export const buildJsonTransformer = <T>(): ValueTransformer => ({
    to: (value: T): string => JSON.stringify(value),
    from: (value: string): T => JSON.parse(value),
});
