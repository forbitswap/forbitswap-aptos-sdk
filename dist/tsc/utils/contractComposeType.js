"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeSwapEvent = exports.composeLiquidityPool = exports.composeCoinStore = exports.composePairInfo = exports.composeSwapPoolData = exports.composeLPCoinType = exports.composeLP = exports.composeLPCoin = void 0;
const contract_1 = require("./contract");
const LPCoinModule = 'LPCoinV1';
const LPCoinType = 'LPCoin';
const forbitSwapLiquidityPool = 'LiquidityPool';
const forbitSwapAdminData = 'AdminData';
const forbitSwapPairInfo = 'PairInfo';
const forbitSwapEvent = 'Events';
function composeLPCoin(address, coin_x, coin_y) {
    return (0, contract_1.composeType)(address, LPCoinModule, LPCoinType, [coin_x, coin_y]);
}
exports.composeLPCoin = composeLPCoin;
function composeLP(swapScript, coin_x, coin_y) {
    return (0, contract_1.composeType)(swapScript, forbitSwapLiquidityPool, [coin_x, coin_y]);
}
exports.composeLP = composeLP;
function composeLPCoinType(address) {
    return (0, contract_1.composeType)(address, LPCoinModule, LPCoinType);
}
exports.composeLPCoinType = composeLPCoinType;
function composeSwapPoolData(swapScript) {
    return (0, contract_1.composeType)(swapScript, forbitSwapAdminData);
}
exports.composeSwapPoolData = composeSwapPoolData;
function composePairInfo(swapScript) {
    return (0, contract_1.composeType)(swapScript, forbitSwapPairInfo);
}
exports.composePairInfo = composePairInfo;
function composeCoinStore(coinStore, coinType) {
    return `${coinStore}<${coinType}>`;
}
exports.composeCoinStore = composeCoinStore;
function composeLiquidityPool(swapScript) {
    return (0, contract_1.composeType)(swapScript, forbitSwapLiquidityPool);
}
exports.composeLiquidityPool = composeLiquidityPool;
function composeSwapEvent(swapScript, coin_x, coin_y) {
    return (0, contract_1.composeType)(swapScript, forbitSwapEvent, [coin_x, coin_y]);
}
exports.composeSwapEvent = composeSwapEvent;
//# sourceMappingURL=contractComposeType.js.map