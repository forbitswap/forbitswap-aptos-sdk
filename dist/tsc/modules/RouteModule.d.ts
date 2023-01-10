import { SDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
import { AptosResourceType, Payload } from '../types/aptos';
import { LiquidityPoolResource } from './SwapModule';
import Decimal from 'decimal.js';
import { BigNumber } from '../types/common';
export declare type Trade = {
    coinPairList: LiquidityPoolResource[];
    amountList: Decimal[];
    coinTypeList: string[];
    priceImpact: Decimal;
};
export declare type SwapCoinParams = {
    fromCoin: AptosResourceType;
    toCoin: AptosResourceType;
    amount: BigNumber;
};
export declare type SwapCoinPayload = {
    trade: Trade;
    slippage: BigNumber;
};
export declare class RouteModule implements IModule {
    protected _sdk: SDK;
    get sdk(): SDK;
    constructor(sdk: SDK);
    /**
     * FromExactCoinToCoin
     * @param pairList all pair list from `getAllLPCoinResourcesWithAdmin()`
     * @param coinTypeOutOrigin out coin type
     * @param maxNumResults top result nums
     * @param maxHops remaining hops
     * @param currentPairs current path pairs
     * @param currentAmounts current path amounts
     * @param nextCoinType next coin type
     * @param nextAmountIn next coin amount in
     * @param fee swap fee
     * @param bestTrades saved trade results
     * @returns bestTrades
     */
    bestTradeExactIn(pairList: LiquidityPoolResource[], coinTypeInOrigin: AptosResourceType, coinTypeOutOrigin: AptosResourceType, maxNumResults: number, maxHops: number, currentPairs: LiquidityPoolResource[], currentAmounts: Decimal[], nextCoinType: AptosResourceType, nextAmountIn: Decimal, fee: Decimal, bestTrades: Trade[]): Promise<Trade[]>;
    /**
     * FromCoinToExactCoin
     * @param pairList all pair list from `getAllLPCoinResourcesWithAdmin()`
     * @param coinTypeInOrigin in coin type
     * @param maxNumResults top result nums
     * @param maxHops remaining hops
     * @param currentPairs current path pairs
     * @param currentAmounts current path amounts
     * @param nextCoinType next coin type
     * @param nextAmountOut next coin amount out
     * @param fee swap fee
     * @param bestTrades saved trade results
     * @returns bestTrades
     */
    bestTradeExactOut(pairList: LiquidityPoolResource[], coinTypeInOrigin: AptosResourceType, coinTypeOutOrigin: AptosResourceType, maxNumResults: number, maxHops: number, currentPairs: LiquidityPoolResource[], currentAmounts: Decimal[], nextCoinType: AptosResourceType, nextAmountOut: Decimal, fee: Decimal, bestTrades: Trade[]): Promise<Trade[]>;
    getRouteSwapExactCoinForCoin({ fromCoin, toCoin, amount, }: SwapCoinParams): Promise<Trade[]>;
    getRouteSwapCoinForExactCoin({ fromCoin, toCoin, amount, }: SwapCoinParams): Promise<Trade[]>;
    swapExactCoinForCoinPayload({ trade, slippage, }: SwapCoinPayload): Payload;
    swapCoinForExactCoinPayload({ trade, slippage, }: SwapCoinPayload): Payload;
}
export declare function sortedInsert<T>(items: T[], add: T, maxSize: number, comparator: (a: T, b: T) => number): void;
export declare function tradeComparator(trade1: Trade, trade2: Trade): number;
export declare function getCoinTypeList(coinInType: AptosResourceType, coinPairList: LiquidityPoolResource[]): AptosResourceType[];
export declare function getPriceImpact(coinInType: AptosResourceType, coinPairList: LiquidityPoolResource[], amountList: Decimal[], fee: Decimal): Decimal;
