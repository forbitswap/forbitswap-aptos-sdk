import { SDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
import { address, AptosCoinInfoResource, AptosEvent, AptosResource, AptosResourceType, Payload } from '../types/aptos';
import { BigNumber } from '../types/common';
import Decimal from 'decimal.js';
export declare type AddLiquidityParams = {
    coinX: AptosResourceType;
    coinY: AptosResourceType;
    amount: BigNumber;
    fixedCoin: 'X' | 'Y';
};
export declare type AddLiquidityReturn = {
    amount: Decimal;
    coinXDivCoinY: Decimal;
    coinYDivCoinX: Decimal;
    shareOfPool: Decimal;
};
export declare type AddLiquidityPayload = {
    coinX: AptosResourceType;
    coinY: AptosResourceType;
    amountX: BigNumber;
    amountY: BigNumber;
    slippage: BigNumber;
};
export declare type RemoveLiquidityParams = {
    coinX: AptosResourceType;
    coinY: AptosResourceType;
    amount: BigNumber;
};
export declare type RemoveLiquidityReturn = {
    amountX: Decimal;
    amountY: Decimal;
};
export declare type RemoveLiquidityPayload = {
    coinX: AptosResourceType;
    coinY: AptosResourceType;
    amount: BigNumber;
    amountXDesired: BigNumber;
    amountYDesired: BigNumber;
    slippage: BigNumber;
};
export declare type SwapRatesParams = {
    fromCoin: AptosResourceType;
    toCoin: AptosResourceType;
    amount: BigNumber;
    fixedCoin: 'from' | 'to';
    slippage: BigNumber;
};
export declare type SwapRatesReturn = {
    amount: Decimal;
    amountWithSlippage: Decimal;
    coinFromDivCoinTo: Decimal;
    coinToDivCoinFrom: Decimal;
};
export declare type SwapPayload = {
    fromCoin: AptosResourceType;
    toCoin: AptosResourceType;
    fromAmount: BigNumber;
    toAmount: BigNumber;
    fixedCoin: 'from' | 'to';
    slippage: BigNumber;
};
export declare type LPCoinResource = {
    coinX: AptosResourceType;
    coinY: AptosResourceType;
    lpCoin: AptosResourceType;
    value: string;
} | null;
export declare type LiquidityPoolResource = {
    coinX: AptosResourceType;
    coinY: AptosResourceType;
    coinXReserve: string;
    coinYReserve: string;
} | null;
export declare type LPCoinParams = {
    address: address;
    coinX: AptosResourceType;
    coinY: AptosResourceType;
};
export declare type PairListResource = [
    {
        coin_x: {
            account_address: string;
            module_name: string;
            struct_name: string;
        };
        coin_y: {
            account_address: string;
            module_name: string;
            struct_name: string;
        };
        lp_coin: {
            account_address: string;
            module_name: string;
            struct_name: string;
        };
    }
];
export declare type CoinPair = {
    coinX: AptosResourceType;
    coinY: AptosResourceType;
};
export declare type PairInfoResource = {
    pair_created_event: AptosResourceType;
    pair_list: PairListResource;
};
export declare type LPCoinAPYReturn = {
    apy: Decimal;
    windowSeconds: Decimal;
};
export declare type LPCoinAPYBatchReturn = {
    apys: {
        [key: string]: Decimal;
    };
    windowSeconds: Decimal;
};
export declare type SwapEventParams = {
    coinPair: CoinPair;
    fieldName: string | 'pair_created_event' | 'mint_event' | 'burn_event' | 'swap_event' | 'sync_event' | 'flash_swap_event';
    query?: {
        start?: bigint | number;
        limit?: number;
    };
};
export declare class SwapModule implements IModule {
    protected _sdk: SDK;
    get sdk(): SDK;
    constructor(sdk: SDK);
    /**
     * Check if pair exists
     * @param coinX coinX
     * @param coinY coinY
     * @returns if pair exists
     */
    isPairExist(coinX: AptosResourceType, coinY: AptosResourceType): Promise<boolean>;
    sortedCoins(coinX: AptosResourceType, coinY: AptosResourceType): AptosResourceType[];
    /**
     * Add liqudity rate, given CoinX, CoinY, fixedCoin and fixedCoin Amount, the function will return meta such as: the other CoinAmount, shareOfPool
     * @param params AddLiquidityParams
     * @returns
     */
    addLiquidityRates({ coinX, coinY, amount, fixedCoin, }: AddLiquidityParams): Promise<AddLiquidityReturn>;
    addLiquidityPayload({ coinX, coinY, amountX, amountY, slippage, }: AddLiquidityPayload): Payload;
    /**
     * Remove liqudity rate, given CoinX, CoinY, LPCoin Amount, the function will return meta such as: amountX, amountY
     * @param params RemoveLiquidityParams
     * @returns
     */
    removeLiquidityRates({ coinX, coinY, amount, }: RemoveLiquidityParams): Promise<RemoveLiquidityReturn>;
    removeLiquidityPayload({ coinX, coinY, amount, amountXDesired, amountYDesired, slippage, }: RemoveLiquidityPayload): Payload;
    /**
     * @deprecated Should use `RouteModule.getRouteSwapExactCoinForCoin` or `RouteModule.getRouteSwapCoinForExactCoin` instead
     * Calculate direct 2 pair swap rate.
     * @param params
     * @returns
     */
    swapRates({ fromCoin, toCoin, amount, fixedCoin, slippage, }: SwapRatesParams): Promise<SwapRatesReturn>;
    swapPayload({ fromCoin, toCoin, fromAmount, toAmount, fixedCoin, slippage, }: SwapPayload): Payload;
    getCoinInfo(coin: AptosResourceType): Promise<AptosResource<AptosCoinInfoResource> | undefined>;
    /**
     * The function will return all LPCoin with a given address
     * @param address
     * @returns
     */
    getAllLPCoinResourcesByAddress(address: address): Promise<LPCoinResource[]>;
    /**
     * The function will return LPCoin amount with a given address and LPCoin pair
     * @param params
     * @returns
     */
    getLPCoinAmount({ address, coinX, coinY, }: LPCoinParams): Promise<LPCoinResource>;
    /**
     * The function will return all pairs created in forbitswap, with CoinX and CoinY full name
     * @returns all pairs
     */
    getAllPairs(): Promise<CoinPair[]>;
    /**
     * The function will return all pairs created in forbitswap, with coin full name and reserve meta
     * @returns
     */
    getAllLPCoinResourcesWithAdmin(): Promise<LiquidityPoolResource[]>;
    /**
     * Get price per LPCoin at a given ledger version
     * The pricePerLPCoin of a new created LPCoin should be equal to `1`, and will increate when getting swap fee
     * @param params coinPair
     * @param ledgerVersion? calculate apy with this version window. Default: latest
     * @returns pricePerLPCoin
     */
    getPricePerLPCoin({ coinX, coinY, }: CoinPair, ledgerVersion?: bigint | number): Promise<Decimal>;
    getPricePerLPCoinBatch(ledgerVersion: bigint | number | undefined, allResources?: AptosResource<unknown>[]): Promise<{
        [key: string]: Decimal;
    }>;
    /**
     * Get LPCoin apy at a given ledger verion window
     * The funciont will return apy and timestamp window
     * @param params coinPair
     * @param deltaVersion calculate apy with this version window. Default: 5000000
     * @returns [apy, queryDeltaTimestampSeconds]
     */
    getLPCoinAPY(params: CoinPair, deltaVersion?: Decimal | string): Promise<LPCoinAPYReturn>;
    getLPCoinAPYBatch(deltaVersion?: Decimal | string): Promise<LPCoinAPYBatchReturn>;
    getEvents(params: SwapEventParams): Promise<AptosEvent[]>;
}
export declare function getCoinOutWithFees(coinInVal: Decimal, reserveInSize: Decimal, reserveOutSize: Decimal, fee: Decimal): Decimal;
export declare function getCoinInWithFees(coinOutVal: Decimal, reserveOutSize: Decimal, reserveInSize: Decimal, fee: Decimal): Decimal;
export declare function withSlippage(value: Decimal, slippage: Decimal, mode: 'plus' | 'minus'): Decimal;
