"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YEAR_NS = exports.BP = exports.divDecimals = exports.mulDecimals = exports.pow10 = exports.secondsToDeadline = exports.d = void 0;
const tslib_1 = require("tslib");
const decimal_js_1 = tslib_1.__importDefault(require("decimal.js"));
decimal_js_1.default.set({ toExpNeg: -9 });
function d(value) {
    if (decimal_js_1.default.isDecimal(value)) {
        return value;
    }
    return new decimal_js_1.default(value === undefined ? 0 : value);
}
exports.d = d;
function secondsToDeadline(deadline) {
    return d(deadline).add(d(Date.now() / 1000).floor()).floor();
}
exports.secondsToDeadline = secondsToDeadline;
function pow10(decimals) {
    return d(10).pow(d(decimals));
}
exports.pow10 = pow10;
function mulDecimals(pretty, decimals) {
    return d(pretty).mul(pow10(decimals || 0));
}
exports.mulDecimals = mulDecimals;
function divDecimals(amount, decimals) {
    return d(amount).div(pow10(decimals || 0));
}
exports.divDecimals = divDecimals;
exports.BP = d(1).div(10000); // 1BP is 0.01%
exports.YEAR_NS = 365 * 86400 * 1000 * 1000;
//# sourceMappingURL=number.js.map