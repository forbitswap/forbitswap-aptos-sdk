"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withSlippage = exports.getCoinInWithFees = exports.getCoinOutWithFees = exports.SwapModule = void 0;
const tslib_1 = require("tslib");
const contract_1 = require("../utils/contract");
const number_1 = require("../utils/number");
const hex_1 = require("../utils/hex");
const is_1 = require("../utils/is");
const contractComposeType_1 = require("../utils/contractComposeType");
const fee = (0, number_1.d)(30);
class SwapModule {
    constructor(sdk) {
        this._sdk = sdk;
    }
    get sdk() {
        return this._sdk;
    }
    /**
     * Check if pair exists
     * @param coinX coinX
     * @param coinY coinY
     * @returns if pair exists
     */
    isPairExist(coinX, coinY) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { modules } = this.sdk.networkOptions;
            // const lpType = composeLP(modules.Scripts, coinX, coinY)
            const isSorted = (0, contract_1.isSortedSymbols)(coinX, coinY);
            const lpType = (0, contractComposeType_1.composeLP)(modules.Scripts, isSorted ? coinX : coinY, isSorted ? coinY : coinX);
            try {
                yield this.sdk.resources.fetchAccountResource(modules.ResourceAccountAddress, lpType);
                return true;
            }
            catch (e) {
                return false;
            }
        });
    }
    sortedCoins(coinX, coinY) {
        const isSorted = (0, contract_1.isSortedSymbols)(coinX, coinY);
        return isSorted ? [coinX, coinY] : [coinY, coinX];
    }
    /**
     * Add liqudity rate, given CoinX, CoinY, fixedCoin and fixedCoin Amount, the function will return meta such as: the other CoinAmount, shareOfPool
     * @param params AddLiquidityParams
     * @returns
     */
    addLiquidityRates({ coinX, coinY, amount, fixedCoin, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            amount = (0, number_1.d)(amount);
            const { modules } = this.sdk.networkOptions;
            const isSorted = (0, contract_1.isSortedSymbols)(coinX, coinY);
            const lpType = (0, contractComposeType_1.composeLP)(modules.Scripts, isSorted ? coinX : coinY, isSorted ? coinY : coinX);
            const lp = yield this.sdk.resources.fetchAccountResource(modules.ResourceAccountAddress, lpType);
            if (!lp) {
                throw new Error(`LiquidityPool (${lpType}) not found`);
            }
            const coinXReserve = (0, number_1.d)(lp.data.coin_x_reserve.value);
            const coinYReserve = (0, number_1.d)(lp.data.coin_y_reserve.value);
            const [reserveX, reserveY] = [coinXReserve, coinYReserve];
            const outputAmount = fixedCoin == 'X'
                ? quote(amount, reserveX, reserveY)
                : quote(amount, reserveY, reserveX);
            return {
                amount: outputAmount,
                coinXDivCoinY: reserveX.div(reserveY),
                coinYDivCoinX: reserveY.div(reserveX),
                shareOfPool: amount.div(reserveX.add(amount)),
            };
        });
    }
    addLiquidityPayload({ coinX, coinY, amountX, amountY, slippage, }) {
        const isSorted = (0, contract_1.isSortedSymbols)(coinX, coinY);
        let [newCoinX, newCoinY, newAmountX, newAmountY] = [coinX, coinY, amountX, amountY];
        if (!isSorted) {
            [newCoinX, newCoinY, newAmountX, newAmountY] = [coinY, coinX, amountY, amountX];
        }
        newAmountX = (0, number_1.d)(newAmountX);
        newAmountY = (0, number_1.d)(newAmountY);
        slippage = (0, number_1.d)(slippage);
        if (slippage.gte(1) || slippage.lte(0)) {
            throw new Error(`Invalid slippage (${slippage}) value`);
        }
        const { modules } = this.sdk.networkOptions;
        const functionName = (0, contract_1.composeType)(modules.Scripts, 'add_liquidity_entry');
        const typeArguments = [
            newCoinX,
            newCoinY,
        ];
        const amountXDesired = newAmountX;
        const amountYDesired = newAmountY;
        const amountXMin = withSlippage(newAmountX, slippage, 'minus');
        const amountYMin = withSlippage(newAmountY, slippage, 'minus');
        const args = [amountXDesired.toString(), amountYDesired.toString(), amountXMin.toString(), amountYMin.toString()];
        return {
            type: 'entry_function_payload',
            function: functionName,
            type_arguments: typeArguments,
            arguments: args,
        };
    }
    /**
     * Remove liqudity rate, given CoinX, CoinY, LPCoin Amount, the function will return meta such as: amountX, amountY
     * @param params RemoveLiquidityParams
     * @returns
     */
    removeLiquidityRates({ coinX, coinY, amount, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            amount = (0, number_1.d)(amount);
            const { modules } = this.sdk.networkOptions;
            const isSorted = (0, contract_1.isSortedSymbols)(coinX, coinY);
            const lpCoin = (0, contractComposeType_1.composeLPCoin)(modules.ResourceAccountAddress, isSorted ? coinX : coinY, isSorted ? coinY : coinX);
            const lpType = (0, contractComposeType_1.composeLP)(modules.Scripts, isSorted ? coinX : coinY, isSorted ? coinY : coinX);
            const task1 = this.sdk.resources.fetchAccountResource(modules.ResourceAccountAddress, lpType);
            const task2 = this.getCoinInfo(lpCoin);
            const [lp, lpCoinInfo] = yield Promise.all([task1, task2]);
            if (!lp) {
                throw new Error(`LiquidityPool (${lpType}) not found`);
            }
            if (!lpCoinInfo) {
                throw new Error(`LpCoin (${lpCoin}) not found`);
            }
            const lpSupply = (0, number_1.d)(lpCoinInfo.data.supply.vec[0].integer.vec[0].value); // lp total supply
            if (amount.gt(lpSupply)) {
                throw new Error(`Invalid amount (${amount}) value, larger than total lpCoin supply`);
            }
            const coinXReserve = (0, number_1.d)(lp.data.coin_x_reserve.value);
            const coinYReserve = (0, number_1.d)(lp.data.coin_y_reserve.value);
            const [reserveX, reserveY] = [coinXReserve, coinYReserve];
            const coinXout = amount.mul(reserveX).div(lpSupply).floor();
            const coinYout = amount.mul(reserveY).div(lpSupply).floor();
            return {
                amountX: coinXout,
                amountY: coinYout,
            };
        });
    }
    removeLiquidityPayload({ coinX, coinY, amount, amountXDesired, amountYDesired, slippage, }) {
        const isSorted = (0, contract_1.isSortedSymbols)(coinX, coinY);
        let [newCoinX, newCoinY, newAmountXDesired, newAmountYDesired] = [coinX, coinY, amountXDesired, amountYDesired];
        if (!isSorted) {
            [newCoinX, newCoinY, newAmountXDesired, newAmountYDesired] = [coinY, coinX, amountYDesired, amountXDesired];
        }
        amount = (0, number_1.d)(amount);
        amountXDesired = (0, number_1.d)(newAmountXDesired);
        amountYDesired = (0, number_1.d)(newAmountYDesired);
        slippage = (0, number_1.d)(slippage);
        if (slippage.gte(1) || slippage.lte(0)) {
            throw new Error(`Invalid slippage (${slippage}) value`);
        }
        const { modules } = this.sdk.networkOptions;
        const functionName = (0, contract_1.composeType)(modules.Scripts, 'remove_liquidity_entry');
        const typeArguments = [newCoinX, newCoinY];
        const amountXMin = withSlippage(amountXDesired, slippage, 'minus');
        const amountYMin = withSlippage(amountYDesired, slippage, 'minus');
        const args = [amount.toString(), amountXMin.toString(), amountYMin.toString()];
        return {
            type: 'entry_function_payload',
            function: functionName,
            type_arguments: typeArguments,
            arguments: args,
        };
    }
    /**
     * @deprecated Should use `RouteModule.getRouteSwapExactCoinForCoin` or `RouteModule.getRouteSwapCoinForExactCoin` instead
     * Calculate direct 2 pair swap rate.
     * @param params
     * @returns
     */
    swapRates({ fromCoin, toCoin, amount, fixedCoin, slippage, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            amount = (0, number_1.d)(amount);
            slippage = (0, number_1.d)(slippage);
            const { modules } = this.sdk.networkOptions;
            const isSorted = (0, contract_1.isSortedSymbols)(fromCoin, toCoin);
            const lpType = (0, contractComposeType_1.composeLP)(modules.Scripts, isSorted ? fromCoin : toCoin, isSorted ? toCoin : fromCoin);
            const lp = yield this.sdk.resources.fetchAccountResource(modules.ResourceAccountAddress, lpType);
            if (!lp) {
                throw new Error(`LiquidityPool (${lpType}) not found`);
            }
            const coinXReserve = (0, number_1.d)(lp.data.coin_x_reserve.value);
            const coinYReserve = (0, number_1.d)(lp.data.coin_y_reserve.value);
            const [reserveFrom, reserveTo] = isSorted
                ? [coinXReserve, coinYReserve]
                : [coinYReserve, coinXReserve];
            const outputCoins = isSorted
                ? getCoinOutWithFees(amount, reserveFrom, reserveTo, fee)
                : getCoinInWithFees(amount, reserveFrom, reserveTo, fee);
            const amountWithSlippage = fixedCoin == 'from'
                ? withSlippage(outputCoins, slippage, 'minus')
                : withSlippage(outputCoins, slippage, 'plus');
            const coinFromDivCoinTo = isSorted
                ? amount.div(outputCoins)
                : outputCoins.div(amount);
            const coinToDivCoinFrom = isSorted
                ? outputCoins.div(amount)
                : amount.div(outputCoins);
            return {
                amount: outputCoins,
                amountWithSlippage: amountWithSlippage,
                coinFromDivCoinTo: coinFromDivCoinTo,
                coinToDivCoinFrom: coinToDivCoinFrom,
            };
        });
    }
    swapPayload({ fromCoin, toCoin, fromAmount, toAmount, fixedCoin, slippage, }) {
        fromAmount = (0, number_1.d)(fromAmount);
        toAmount = (0, number_1.d)(toAmount);
        slippage = (0, number_1.d)(slippage);
        if (slippage.gte(1) || slippage.lte(0)) {
            throw new Error(`Invalid slippage (${slippage}) value`);
        }
        const { modules } = this.sdk.networkOptions;
        const functionName = (0, contract_1.composeType)(modules.Scripts, fixedCoin === 'from' ? 'swap_exact_coins_for_coins_entry' : 'swap_coins_for_exact_coins_entry');
        const typeArguments = [fromCoin, toCoin];
        const frontAmount = fixedCoin === 'from' ? fromAmount : toAmount;
        const backAmount = fixedCoin === 'to'
            ? withSlippage(fromAmount, slippage, 'plus')
            : withSlippage(toAmount, slippage, 'minus');
        const args = [frontAmount.toString(), backAmount.toString()];
        return {
            type: 'entry_function_payload',
            function: functionName,
            type_arguments: typeArguments,
            arguments: args,
        };
    }
    getCoinInfo(coin) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { modules } = this.sdk.networkOptions;
            const coinInfo = yield this.sdk.resources.fetchAccountResource((0, contract_1.extractAddressFromType)(coin), (0, contract_1.composeType)(modules.CoinInfo, [coin]));
            return coinInfo;
        });
    }
    /**
     * The function will return all LPCoin with a given address
     * @param address
     * @returns
     */
    getAllLPCoinResourcesByAddress(address) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { modules } = this.sdk.networkOptions;
            const resources = yield this.sdk.resources.fetchAccountResources(address);
            if (!resources) {
                throw new Error('resources not found');
            }
            const lpCoinType = (0, contractComposeType_1.composeLPCoinType)(modules.ResourceAccountAddress);
            const regexStr = `^${modules.CoinStore}<${lpCoinType}<(.+?::.+?::.+?(<.+>)?), (.+?::.+?::.+?(<.+>)?)>>$`;
            const filteredResource = resources.map(resource => {
                const regex = new RegExp(regexStr, 'g');
                const regexResult = regex.exec(resource.type);
                if (!regexResult)
                    return null;
                const coinX = regexResult[1];
                const coinY = regexResult[3];
                const lpCoin = (0, contractComposeType_1.composeLPCoin)(modules.ResourceAccountAddress, coinX, coinY);
                return {
                    coinX,
                    coinY,
                    lpCoin,
                    value: resource.data.coin.value,
                };
            }).filter(is_1.notEmpty);
            if (!filteredResource) {
                throw new Error(`filteredResource (${filteredResource}) not found`);
            }
            return filteredResource;
        });
    }
    /**
     * The function will return LPCoin amount with a given address and LPCoin pair
     * @param params
     * @returns
     */
    getLPCoinAmount({ address, coinX, coinY, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { modules } = this.sdk.networkOptions;
            const isSorted = (0, contract_1.isSortedSymbols)(coinX, coinY);
            const lpCoin = (0, contractComposeType_1.composeLPCoin)(modules.ResourceAccountAddress, isSorted ? coinX : coinY, isSorted ? coinY : coinX);
            const coinStoreLP = (0, contractComposeType_1.composeCoinStore)(modules.CoinStore, lpCoin);
            const lpCoinStore = yield this.sdk.resources.fetchAccountResource(address, coinStoreLP);
            if (!lpCoinStore) {
                throw new Error(`LPCoin (${coinStoreLP}) not found`);
            }
            return {
                coinX: isSorted ? coinX : coinY,
                coinY: isSorted ? coinY : coinX,
                lpCoin: lpCoin,
                value: lpCoinStore.data.coin.value,
            };
        });
    }
    /**
     * The function will return all pairs created in forbitswap, with CoinX and CoinY full name
     * @returns all pairs
     */
    getAllPairs() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { modules } = this.sdk.networkOptions;
            const pairInfoType = (0, contractComposeType_1.composePairInfo)(modules.Scripts);
            const pairInfo = yield this.sdk.resources.fetchAccountResource(modules.ResourceAccountAddress, pairInfoType);
            if (!pairInfo) {
                throw new Error(`PairInfo (${pairInfoType}) not found`);
            }
            const pairList = pairInfo.data.pair_list;
            const ret = pairList.map(v => {
                return {
                    coinX: `${v.coin_x.account_address}::${(0, hex_1.hexToString)(v.coin_x.module_name)}::${(0, hex_1.hexToString)(v.coin_x.struct_name)}`,
                    coinY: `${v.coin_y.account_address}::${(0, hex_1.hexToString)(v.coin_y.module_name)}::${(0, hex_1.hexToString)(v.coin_y.struct_name)}`,
                };
            });
            return ret;
        });
    }
    /**
     * The function will return all pairs created in forbitswap, with coin full name and reserve meta
     * @returns
     */
    getAllLPCoinResourcesWithAdmin() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { modules } = this.sdk.networkOptions;
            const resources = yield this.sdk.resources.fetchAccountResources(modules.ResourceAccountAddress);
            if (!resources) {
                throw new Error('resources not found');
            }
            const lpCoinType = (0, contractComposeType_1.composeLiquidityPool)(modules.Scripts);
            const regexStr = `^${lpCoinType}<(.+?::.+?::.+?(<.+>)?), (.+?::.+?::.+?(<.+>)?)>$`;
            const filteredResource = resources.map(resource => {
                const regex = new RegExp(regexStr, 'g');
                const regexResult = regex.exec(resource.type);
                if (!regexResult)
                    return null;
                return {
                    coinX: regexResult[1],
                    coinY: regexResult[3],
                    coinXReserve: resource.data.coin_x_reserve.value,
                    coinYReserve: resource.data.coin_y_reserve.value,
                };
            }).filter(is_1.notEmpty);
            if (!filteredResource) {
                throw new Error(`filteredResource (${filteredResource}) not found`);
            }
            return filteredResource;
        });
    }
    /**
     * Get price per LPCoin at a given ledger version
     * The pricePerLPCoin of a new created LPCoin should be equal to `1`, and will increate when getting swap fee
     * @param params coinPair
     * @param ledgerVersion? calculate apy with this version window. Default: latest
     * @returns pricePerLPCoin
     */
    getPricePerLPCoin({ coinX, coinY, }, ledgerVersion) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { modules } = this.sdk.networkOptions;
            const isSorted = (0, contract_1.isSortedSymbols)(coinX, coinY);
            const lpCoin = (0, contractComposeType_1.composeLPCoin)(modules.ResourceAccountAddress, isSorted ? coinX : coinY, isSorted ? coinY : coinX);
            const lpType = (0, contractComposeType_1.composeLP)(modules.Scripts, isSorted ? coinX : coinY, isSorted ? coinY : coinX);
            const task1 = this.sdk.resources.fetchAccountResource(modules.ResourceAccountAddress, lpType, ledgerVersion);
            const task2 = this.getCoinInfo(lpCoin);
            const [lp, lpCoinInfo] = yield Promise.all([task1, task2]);
            if (!lp) {
                throw new Error(`LiquidityPool (${lpType}) not found`);
            }
            if (!lpCoinInfo) {
                throw new Error(`LpCoin (${lpCoin}) not found`);
            }
            const lpSupply = lpCoinInfo.data.supply.vec[0].integer.vec[0].value; // lp total supply
            const pricePerLPCoin = (0, number_1.d)(lp.data.coin_x_reserve.value).mul((0, number_1.d)(lp.data.coin_y_reserve.value)).sqrt().div((0, number_1.d)(lpSupply));
            return pricePerLPCoin;
        });
    }
    // ledgerVersion undefined for now
    getPricePerLPCoinBatch(ledgerVersion, allResources) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { modules } = this.sdk.networkOptions;
            if (!allResources) {
                allResources = yield this.sdk.resources.fetchAccountResources(modules.ResourceAccountAddress, ledgerVersion);
            }
            if (!allResources) {
                throw new Error('resources not found');
            }
            const coinPair2SwapPoolResource = {};
            const coinPair2LPSupply = {};
            const coinPair2PricePerLPCoin = {};
            const lpCoinType1 = (0, contractComposeType_1.composeLiquidityPool)(modules.Scripts);
            const regexStr1 = `^${lpCoinType1}<(.+?::.+?::.+?(<.+>)?), (.+?::.+?::.+?(<.+>)?)>$`;
            const lpCoinType2 = (0, contractComposeType_1.composeLPCoinType)(modules.ResourceAccountAddress);
            const regexStr2 = `^${modules.CoinInfo}<${lpCoinType2}<(.+?::.+?::.+?(<.+>)?), (.+?::.+?::.+?(<.+>)?)>>$`;
            allResources.forEach(resource => {
                var _a, _b, _c, _d, _e, _f;
                // try parse to SwapPoolResource
                const swapPool = resource.data;
                if (((_a = swapPool === null || swapPool === void 0 ? void 0 : swapPool.coin_x_reserve) === null || _a === void 0 ? void 0 : _a.value) && ((_b = swapPool === null || swapPool === void 0 ? void 0 : swapPool.coin_y_reserve) === null || _b === void 0 ? void 0 : _b.value)) {
                    const regex = new RegExp(regexStr1, 'g');
                    const regexResult = regex.exec(resource.type);
                    if (regexResult) {
                        const coinX = regexResult[1];
                        const coinY = regexResult[3];
                        coinPair2SwapPoolResource[`${coinX}, ${coinY}`] = (0, number_1.d)(swapPool.coin_x_reserve.value).mul((0, number_1.d)(swapPool.coin_y_reserve.value)).sqrt();
                    }
                }
                // try parse to lpSupply
                const coinInfo = resource.data;
                if ((_f = (_e = (_d = (_c = coinInfo === null || coinInfo === void 0 ? void 0 : coinInfo.supply) === null || _c === void 0 ? void 0 : _c.vec[0]) === null || _d === void 0 ? void 0 : _d.integer) === null || _e === void 0 ? void 0 : _e.vec[0]) === null || _f === void 0 ? void 0 : _f.value) {
                    const regex = new RegExp(regexStr2, 'g');
                    const regexResult = regex.exec(resource.type);
                    if (regexResult) {
                        const coinX = regexResult[1];
                        const coinY = regexResult[3];
                        coinPair2LPSupply[`${coinX}, ${coinY}`] = (0, number_1.d)(coinInfo.supply.vec[0].integer.vec[0].value);
                    }
                }
            });
            for (const key of Object.keys(coinPair2SwapPoolResource)) {
                coinPair2PricePerLPCoin[key] = coinPair2SwapPoolResource[key].div(coinPair2LPSupply[key]);
            }
            return coinPair2PricePerLPCoin;
        });
    }
    /**
     * Get LPCoin apy at a given ledger verion window
     * The funciont will return apy and timestamp window
     * @param params coinPair
     * @param deltaVersion calculate apy with this version window. Default: 5000000
     * @returns [apy, queryDeltaTimestampSeconds]
     */
    getLPCoinAPY(params, deltaVersion) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const ledgerInfo = yield this.sdk.resources.fetchLedgerInfo();
            const timestampNow = ledgerInfo.ledger_timestamp;
            const currentLedgerVersion = ledgerInfo.ledger_version;
            const oldestLedgerVersion = ledgerInfo.oldest_ledger_version;
            const queryDeltaVersion = deltaVersion ? deltaVersion : 5e6.toString();
            const queryLedgerVersion = (0, number_1.d)(currentLedgerVersion).sub(queryDeltaVersion).gte((0, number_1.d)(oldestLedgerVersion))
                ? (0, number_1.d)(currentLedgerVersion).sub(queryDeltaVersion)
                : (0, number_1.d)(oldestLedgerVersion);
            const task1 = this.getPricePerLPCoin(params);
            const task2 = this.getPricePerLPCoin(params, BigInt(queryLedgerVersion.toString()));
            const task3 = this.sdk.resources.fetchTransactionByVersion(BigInt(queryLedgerVersion.toString()));
            const [currentPricePerLPCoin, queryPricePerLPCoin, txn] = yield Promise.all([task1, task2, task3]);
            const deltaTimestamp = (0, number_1.d)(timestampNow).sub((0, number_1.d)(txn.timestamp));
            const apy = currentPricePerLPCoin.sub(queryPricePerLPCoin).div(queryPricePerLPCoin).mul(number_1.YEAR_NS).div(deltaTimestamp);
            return {
                apy,
                windowSeconds: deltaTimestamp.div(1e6).floor(),
            };
        });
    }
    getLPCoinAPYBatch(deltaVersion) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const ledgerInfo = yield this.sdk.resources.fetchLedgerInfo();
            const timestampNow = ledgerInfo.ledger_timestamp;
            const currentLedgerVersion = ledgerInfo.ledger_version;
            const oldestLedgerVersion = ledgerInfo.oldest_ledger_version;
            const queryDeltaVersion = deltaVersion ? deltaVersion : 1e6.toString();
            const queryLedgerVersion = (0, number_1.d)(currentLedgerVersion).sub(queryDeltaVersion).gte((0, number_1.d)(oldestLedgerVersion))
                ? (0, number_1.d)(currentLedgerVersion).sub(queryDeltaVersion)
                : (0, number_1.d)(oldestLedgerVersion);
            const task1 = this.getPricePerLPCoinBatch(undefined);
            const task2 = this.getPricePerLPCoinBatch(BigInt(queryLedgerVersion.toString()));
            const task3 = this.sdk.resources.fetchTransactionByVersion(BigInt(queryLedgerVersion.toString()));
            const [coinX2coinY2DecimalCurrent, coinX2coinY2DecimalPast, txn] = yield Promise.all([task1, task2, task3]);
            const deltaTimestamp = (0, number_1.d)(timestampNow).sub((0, number_1.d)(txn.timestamp));
            const coinX2coinY2APY = {};
            for (const key of Object.keys(coinX2coinY2DecimalCurrent)) {
                const base = coinX2coinY2DecimalPast[key];
                if (base) {
                    coinX2coinY2APY[key] = coinX2coinY2DecimalCurrent[key].sub(base).div(base).mul(number_1.YEAR_NS).div(deltaTimestamp);
                }
                else {
                    coinX2coinY2APY[key] = (0, number_1.d)(NaN);
                }
            }
            return {
                apys: coinX2coinY2APY,
                windowSeconds: deltaTimestamp.div(1e6).floor(),
            };
        });
    }
    // get events by coinPair and eventType
    getEvents(params) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { modules } = this.sdk.networkOptions;
            const eventHandleStruct = (0, contractComposeType_1.composeSwapEvent)(modules.Scripts, params.coinPair.coinX, params.coinPair.coinY);
            const events = yield this.sdk.resources.getEventsByEventHandle(modules.ResourceAccountAddress, eventHandleStruct, params.fieldName, params.query);
            return events;
        });
    }
}
exports.SwapModule = SwapModule;
function getCoinOutWithFees(coinInVal, reserveInSize, reserveOutSize, fee) {
    const { feePct, feeScale } = { feePct: fee, feeScale: (0, number_1.d)(10000) };
    const feeMultiplier = feeScale.sub(feePct);
    const coinInAfterFees = coinInVal.mul(feeMultiplier);
    const newReservesInSize = reserveInSize.mul(feeScale).plus(coinInAfterFees);
    return coinInAfterFees.mul(reserveOutSize).div(newReservesInSize).floor();
}
exports.getCoinOutWithFees = getCoinOutWithFees;
function getCoinInWithFees(coinOutVal, reserveOutSize, reserveInSize, fee) {
    const { feePct, feeScale } = { feePct: fee, feeScale: (0, number_1.d)(10000) };
    const feeMultiplier = feeScale.sub(feePct);
    const newReservesOutSize = reserveOutSize.sub(coinOutVal).mul(feeMultiplier);
    return coinOutVal.mul(feeScale).mul(reserveInSize).div(newReservesOutSize).plus(1).floor();
}
exports.getCoinInWithFees = getCoinInWithFees;
function withSlippage(value, slippage, mode) {
    const amountWithSlippage = value[mode](value.mul(slippage));
    return mode === 'plus' ? amountWithSlippage.ceil() : amountWithSlippage.floor();
}
exports.withSlippage = withSlippage;
function quote(amountX, reserveX, reserveY) {
    return amountX.mul(reserveY).div(reserveX).floor();
}
//# sourceMappingURL=SwapModule.js.map