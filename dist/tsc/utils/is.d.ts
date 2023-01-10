import { AxiosError } from 'axios';
export declare function isAxiosError(e: any): e is AxiosError;
export declare function notEmpty<TValue>(value: TValue | null | undefined): value is TValue;
