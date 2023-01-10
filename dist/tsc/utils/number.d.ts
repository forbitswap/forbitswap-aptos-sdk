import Decimal from 'decimal.js';
import { BigNumber } from '../types/common';
export declare function d(value?: BigNumber): Decimal;
export declare function secondsToDeadline(deadline: BigNumber): Decimal;
export declare function pow10(decimals: BigNumber): Decimal;
export declare function mulDecimals(pretty: BigNumber, decimals: BigNumber): Decimal;
export declare function divDecimals(amount: BigNumber, decimals: BigNumber): Decimal;
export declare const BP: Decimal;
export declare const YEAR_NS: number;
