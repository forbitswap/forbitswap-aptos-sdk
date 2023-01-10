"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notEmpty = exports.isAxiosError = void 0;
// eslint-disable-next-line
function isAxiosError(e) {
    if (e.isAxiosError) {
        return e;
    }
    return e;
}
exports.isAxiosError = isAxiosError;
function notEmpty(value) {
    if (value === null || value === undefined)
        return false;
    return true;
}
exports.notEmpty = notEmpty;
//# sourceMappingURL=is.js.map