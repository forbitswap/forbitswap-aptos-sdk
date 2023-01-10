"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPriceImpact = exports.getCoinTypeList = exports.tradeComparator = exports.sortedInsert = exports.RouteModule = void 0;
const tslib_1 = require("tslib");
const number_1 = require("../utils/number");
const SwapModule_1 = require("./SwapModule");
const contract_1 = require("../utils/contract");
const U64MAX = (0, number_1.d)('18446744073709551615'); // 2^64-1
const fee = (0, number_1.d)(30);
class RouteModule {
    constructor(sdk) {
        this._sdk = sdk;
    }
    get sdk() {
        return this._sdk;
    }
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
    bestTradeExactIn(pairList, coinTypeInOrigin, coinTypeOutOrigin, maxNumResults, maxHops, currentPairs, currentAmounts, nextCoinType, nextAmountIn, fee, bestTrades) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < pairList.length; i++) {
                const pair = pairList[i];
                if (!pair)
                    continue;
                if (!(pair.coinX == nextCoinType) && !(pair.coinY == nextCoinType))
                    continue;
                if (pair.coinXReserve === '0' || pair.coinYReserve === '0')
                    continue;
                const coinTypeOut = (pair.coinX == nextCoinType)
                    ? pair.coinY
                    : pair.coinX;
                const [reserveIn, reserveOut] = (pair.coinX == nextCoinType)
                    ? [(0, number_1.d)(pair.coinXReserve), (0, number_1.d)(pair.coinYReserve)]
                    : [(0, number_1.d)(pair.coinYReserve), (0, number_1.d)(pair.coinXReserve)];
                const coinOut = (0, SwapModule_1.getCoinOutWithFees)(nextAmountIn, reserveIn, reserveOut, fee);
                if (coinOut.lt(0) || coinOut.gt(reserveOut))
                    continue;
                // we have arrived at the output token, so this is the final trade of one of the paths
                if (coinTypeOut == coinTypeOutOrigin) {
                    const coinPairList = [...currentPairs, pair];
                    const amountList = [...currentAmounts, coinOut];
                    const coinTypeList = getCoinTypeList(coinTypeInOrigin, coinPairList);
                    const priceImpact = getPriceImpact(coinTypeInOrigin, coinPairList, amountList, fee);
                    const newTrade = {
                        coinPairList,
                        amountList,
                        coinTypeList,
                        priceImpact,
                    };
                    sortedInsert(bestTrades, newTrade, maxNumResults, tradeComparator);
                }
                else if (maxHops > 1 && pairList.length > 1) {
                    const pairListExcludingThisPair = pairList.slice(0, i).concat(pairList.slice(i + 1, pairList.length));
                    this.bestTradeExactIn(pairListExcludingThisPair, coinTypeInOrigin, coinTypeOutOrigin, maxNumResults, maxHops - 1, [...currentPairs, pair], [...currentAmounts, coinOut], coinTypeOut, coinOut, fee, bestTrades);
                }
            }
            return bestTrades;
        });
    }
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
    bestTradeExactOut(pairList, coinTypeInOrigin, coinTypeOutOrigin, maxNumResults, maxHops, currentPairs, currentAmounts, nextCoinType, nextAmountOut, fee, bestTrades) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < pairList.length; i++) {
                const pair = pairList[i];
                if (!pair)
                    continue;
                if (!(pair.coinX == nextCoinType) && !(pair.coinY == nextCoinType))
                    continue;
                if (pair.coinXReserve === '0' || pair.coinYReserve === '0')
                    continue;
                const coinTypeIn = (pair.coinX == nextCoinType)
                    ? pair.coinY
                    : pair.coinX;
                const [reserveIn, reserveOut] = (pair.coinX == nextCoinType)
                    ? [(0, number_1.d)(pair.coinYReserve), (0, number_1.d)(pair.coinXReserve)]
                    : [(0, number_1.d)(pair.coinXReserve), (0, number_1.d)(pair.coinYReserve)];
                const coinIn = (0, SwapModule_1.getCoinInWithFees)(nextAmountOut, reserveOut, reserveIn, fee);
                if (coinIn.lt(0) || coinIn.gt(U64MAX))
                    continue;
                // we have arrived at the output token, so this is the final trade of one of the paths
                if (coinTypeIn == coinTypeInOrigin) {
                    const coinPairList = [pair, ...currentPairs];
                    const amountList = [coinIn, ...currentAmounts];
                    const coinTypeList = getCoinTypeList(coinTypeInOrigin, coinPairList);
                    const priceImpact = getPriceImpact(coinTypeInOrigin, coinPairList, amountList, fee);
                    const newTrade = {
                        coinPairList,
                        amountList,
                        coinTypeList,
                        priceImpact,
                    };
                    sortedInsert(bestTrades, newTrade, maxNumResults, tradeComparator);
                }
                else if (maxHops > 1 && pairList.length > 1) {
                    const pairListExcludingThisPair = pairList.slice(0, i).concat(pairList.slice(i + 1, pairList.length));
                    this.bestTradeExactOut(pairListExcludingThisPair, coinTypeInOrigin, coinTypeOutOrigin, maxNumResults, maxHops - 1, [pair, ...currentPairs], [coinIn, ...currentAmounts], coinTypeIn, coinIn, fee, bestTrades);
                }
            }
            return bestTrades;
        });
    }
    getRouteSwapExactCoinForCoin({ fromCoin, toCoin, amount, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            amount = (0, number_1.d)(amount);
            const pairList = yield this._sdk.swap.getAllLPCoinResourcesWithAdmin();
            const bestTrades = this.bestTradeExactIn(pairList, fromCoin, toCoin, 3, 3, [], [amount], fromCoin, amount, fee, []);
            return bestTrades;
        });
    }
    getRouteSwapCoinForExactCoin({ fromCoin, toCoin, amount, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            amount = (0, number_1.d)(amount);
            const pairList = yield this._sdk.swap.getAllLPCoinResourcesWithAdmin();
            const bestTrades = this.bestTradeExactOut(pairList, fromCoin, toCoin, 3, 3, [], [amount], toCoin, amount, fee, []);
            return bestTrades;
        });
    }
    swapExactCoinForCoinPayload({ trade, slippage, }) {
        if (trade.coinPairList.length > 3 || trade.coinPairList.length < 1) {
            throw new Error(`Invalid coin pair length (${trade.coinPairList.length}) value`);
        }
        const { modules } = this.sdk.networkOptions;
        let functionEntryName = '';
        if (trade.coinPairList.length == 1) {
            functionEntryName = 'swap_exact_coins_for_coins_entry';
        }
        else if (trade.coinPairList.length == 2) {
            functionEntryName = 'swap_exact_coins_for_coins_2_pair_entry';
        }
        else if (trade.coinPairList.length == 3) {
            functionEntryName = 'swap_exact_coins_for_coins_3_pair_entry';
        }
        const functionName = (0, contract_1.composeType)(modules.Scripts, functionEntryName);
        const typeArguments = trade.coinTypeList;
        const fromAmount = trade.amountList[0];
        const toAmount = (0, SwapModule_1.withSlippage)((0, number_1.d)(trade.amountList[trade.amountList.length - 1]), (0, number_1.d)(slippage), 'minus');
        const args = [fromAmount.toString(), toAmount.toString()];
        return {
            type: 'entry_function_payload',
            function: functionName,
            type_arguments: typeArguments,
            arguments: args,
        };
    }
    swapCoinForExactCoinPayload({ trade, slippage, }) {
        if (trade.coinPairList.length > 3 || trade.coinPairList.length < 1) {
            throw new Error(`Invalid coin pair length (${trade.coinPairList.length}) value`);
        }
        const { modules } = this.sdk.networkOptions;
        let functionEntryName = '';
        if (trade.coinPairList.length == 1) {
            functionEntryName = 'swap_coins_for_exact_coins_entry';
        }
        else if (trade.coinPairList.length == 2) {
            functionEntryName = 'swap_coins_for_exact_coins_2_pair_entry';
        }
        else if (trade.coinPairList.length == 3) {
            functionEntryName = 'swap_coins_for_exact_coins_3_pair_entry';
        }
        const functionName = (0, contract_1.composeType)(modules.Scripts, functionEntryName);
        const typeArguments = trade.coinTypeList;
        const toAmount = trade.amountList[trade.amountList.length - 1];
        const fromAmount = (0, SwapModule_1.withSlippage)((0, number_1.d)(trade.amountList[0]), (0, number_1.d)(slippage), 'plus');
        const args = [toAmount.toString(), fromAmount.toString()];
        return {
            type: 'entry_function_payload',
            function: functionName,
            type_arguments: typeArguments,
            arguments: args,
        };
    }
}
exports.RouteModule = RouteModule;
function sortedInsert(items, add, maxSize, comparator) {
    let index;
    for (index = 0; index < items.length; index++) {
        const comp = comparator(items[index], add);
        if (comp >= 0) {
            break;
        }
        else if (comp == -1) {
            continue;
        }
    }
    items.splice(index, 0, add);
    if (items.length > maxSize) {
        items.pop();
    }
}
exports.sortedInsert = sortedInsert;
function tradeComparator(trade1, trade2) {
    const trade1In = (0, number_1.d)(trade1.amountList[0]);
    const trade2In = (0, number_1.d)(trade2.amountList[0]);
    const trade1Out = (0, number_1.d)(trade1.amountList[trade1.amountList.length - 1]);
    const trade2Out = (0, number_1.d)(trade2.amountList[trade2.amountList.length - 1]);
    if (trade1In.eq(trade2In)) {
        if (trade1Out.eq(trade2Out)) {
            return trade1.amountList.length - trade2.amountList.length;
        }
        if (trade1Out.lessThan(trade2Out)) {
            return 1;
        }
        else {
            return -1;
        }
    }
    else {
        if (trade1In.lessThan(trade2In)) {
            return -1;
        }
        else {
            return 1;
        }
    }
}
exports.tradeComparator = tradeComparator;
function getCoinTypeList(coinInType, coinPairList) {
    const coinTypeList = [coinInType];
    let currentCoinType = coinInType;
    for (let i = 0; i < coinPairList.length; i++) {
        const coinPair = coinPairList[i];
        if (!coinPair)
            continue;
        if (coinPair.coinX == currentCoinType) {
            currentCoinType = coinPair.coinY;
            coinTypeList.push(coinPair.coinY);
        }
        else {
            currentCoinType = coinPair.coinX;
            coinTypeList.push(coinPair.coinX);
        }
    }
    return coinTypeList;
}
exports.getCoinTypeList = getCoinTypeList;
// calculated as: abs(realAmountOut - noImpactAmountOut) / noImpactAmountOut
function getPriceImpact(coinInType, coinPairList, amountList, fee) {
    const realAmountOut = amountList[amountList.length - 1];
    let noImpactAmountOut = amountList[0].mul((0, number_1.d)(10000).sub(fee)).div(10000);
    let currentCoinType = coinInType;
    for (let i = 0; i < coinPairList.length; i++) {
        const coinPair = coinPairList[i];
        if (!coinPair)
            continue;
        if (coinPair.coinX == currentCoinType) {
            currentCoinType = coinPair.coinY;
            noImpactAmountOut = noImpactAmountOut.mul((0, number_1.d)(coinPair.coinYReserve)).div((0, number_1.d)(coinPair.coinXReserve));
        }
        else {
            currentCoinType = coinPair.coinX;
            noImpactAmountOut = noImpactAmountOut.mul((0, number_1.d)(coinPair.coinXReserve)).div((0, number_1.d)(coinPair.coinYReserve));
        }
    }
    const priceImpact = realAmountOut.sub(noImpactAmountOut).div(noImpactAmountOut);
    return priceImpact.abs();
}
exports.getPriceImpact = getPriceImpact;
//# sourceMappingURL=RouteModule.js.map