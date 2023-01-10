"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAptosType = exports.extractAddressFromType = exports.composeType = exports.isSortedSymbols = void 0;
const hex_1 = require("./hex");
const EQUAL = 0;
const LESS_THAN = 1;
const GREATER_THAN = 2;
function cmp(a, b) {
    if (a === b) {
        return EQUAL;
    }
    else if (a < b) {
        return LESS_THAN;
    }
    else {
        return GREATER_THAN;
    }
}
// forbitswap define `<` :
// 1. length(CoinType1) < length(CoinType1)
// 2. length(CoinType1) == length(CoinType1) && String(CoinType1) < String(CoinType2)
function compare(symbolX, symbolY) {
    const iX = symbolX.length;
    const iY = symbolY.length;
    const lengthCmp = cmp(iX, iY);
    if (lengthCmp !== 0)
        return lengthCmp;
    const minLength = Math.min(iX, iY);
    let index = 0;
    while (index < minLength - 1) {
        const elemCmp = cmp(symbolX.charCodeAt(index), symbolY.charCodeAt(index));
        if (elemCmp !== 0) {
            return elemCmp;
        }
        index++;
    }
    return cmp(iX, iY);
}
function isSortedSymbols(symbolX, symbolY) {
    return compare(symbolX, symbolY) === LESS_THAN;
}
exports.isSortedSymbols = isSortedSymbols;
function composeType(address, ...args) {
    const generics = Array.isArray(args[args.length - 1])
        ? args.pop()
        : [];
    const chains = [address, ...args].filter(Boolean);
    let result = chains.join('::');
    if (generics && generics.length) {
        result += `<${generics.join(',')}>`;
    }
    return result;
}
exports.composeType = composeType;
function extractAddressFromType(type) {
    return type.split('::')[0];
}
exports.extractAddressFromType = extractAddressFromType;
function checkAptosType(type, options = { leadingZero: true }) {
    var _a, _b, _c, _d, _e;
    let _type = type.replace(/\s/g, '');
    const openBracketsCount = (_b = (_a = _type.match(/</g)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
    const closeBracketsCount = (_d = (_c = _type.match(/>/g)) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0;
    if (openBracketsCount !== closeBracketsCount) {
        return false;
    }
    const genericsString = _type.match(/(<.+>)$/);
    const generics = (_e = genericsString === null || genericsString === void 0 ? void 0 : genericsString[1]) === null || _e === void 0 ? void 0 : _e.match(/(\w+::\w+::\w+)(?:<.*?>(?!>))?/g);
    if (generics) {
        _type = _type.slice(0, _type.indexOf('<'));
        const validGenerics = generics.every((g) => {
            var _a, _b, _c, _d;
            const gOpenCount = (_b = (_a = g.match(/</g)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
            const gCloseCount = (_d = (_c = g.match(/>/g)) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0;
            let t = g;
            if (gOpenCount !== gCloseCount) {
                t = t.slice(0, -(gCloseCount - gOpenCount));
            }
            return checkAptosType(t, options);
        });
        if (!validGenerics) {
            return false;
        }
    }
    const parts = _type.split('::');
    if (parts.length !== 3) {
        return false;
    }
    return ((0, hex_1.checkAddress)(parts[0], options) &&
        parts[1].length >= 1 &&
        parts[2].length >= 1);
}
exports.checkAptosType = checkAptosType;
//# sourceMappingURL=contract.js.map