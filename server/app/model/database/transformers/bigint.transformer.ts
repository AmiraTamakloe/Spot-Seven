// Based on https://github.com/typeorm/typeorm/issues/2400#issuecomment-509211852
// To convert Postgres bigint, which is deserialized as a string instead of a number because of overflow issues

import { ValueTransformer } from 'typeorm';

const NUMBER_SYSTEM_BASE = 10;

// For our application, the values woulnd't cause an overflow issue
export const bigIntTransformer: ValueTransformer = {
    to: (value: number) => value,
    from: (dataBaseValue: string) => parseInt(dataBaseValue, NUMBER_SYSTEM_BASE),
};
