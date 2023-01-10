import Decimal from 'decimal.js';
import { CoinPair } from './modules/SwapModule';
declare type SwapEventsGroup = {
    coinXIn: Decimal;
    coinXOut: Decimal;
    coinYIn: Decimal;
    coinYOut: Decimal;
    number: number;
};
export declare function parseAllLPCoins(): Promise<void>;
export declare function getCoinPairSwapEvents(coinPair: CoinPair, startVersion: string): Promise<SwapEventsGroup>;
export {};
