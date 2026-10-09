import { mock } from 'jest-mock-extended';

export type DeepPartial<T> = NonNullable<Parameters<typeof mock<T>>[0]>;
