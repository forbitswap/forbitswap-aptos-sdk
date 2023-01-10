"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexToString = exports.bufferToHex = exports.toBuffer = exports.checkAddress = exports.shortAddress = exports.shortString = exports.addHexPrefix = void 0;
const HEX_REGEXP = /^[-+]?[0-9A-Fa-f]+\.?[0-9A-Fa-f]*?$/;
function addHexPrefix(hex) {
    return !hex.startsWith('0x') ? '0x' + hex : hex;
}
exports.addHexPrefix = addHexPrefix;
function shortString(str, start = 4, end = 4) {
    const slen = Math.max(start, 1);
    const elen = Math.max(end, 1);
    return str.slice(0, slen + 2) + ' ... ' + str.slice(-elen);
}
exports.shortString = shortString;
function shortAddress(address, start = 4, end = 4) {
    return shortString(addHexPrefix(address), start, end);
}
exports.shortAddress = shortAddress;
function checkAddress(address, options = { leadingZero: true }) {
    let str = address;
    if (options.leadingZero) {
        if (!address.startsWith('0x')) {
            return false;
        }
        else {
            str = str.substring(2);
        }
    }
    return HEX_REGEXP.test(str);
}
exports.checkAddress = checkAddress;
/**
 * Attempts to turn a value into a `Buffer`. As input it supports `Buffer`, `String`, `Number`, null/undefined, `BN` and other objects with a `toArray()` method.
 * @param v the value
 */
// eslint-disable-next-line
function toBuffer(v) {
    if (!Buffer.isBuffer(v)) {
        if (Array.isArray(v)) {
            v = Buffer.from(v);
        }
        else if (typeof v === 'string') {
            if (exports.isHexString(v)) {
                v = Buffer.from(exports.padToEven(exports.stripHexPrefix(v)), 'hex');
            }
            else {
                v = Buffer.from(v);
            }
        }
        else if (typeof v === 'number') {
            v = exports.intToBuffer(v);
        }
        else if (v === null || v === undefined) {
            v = Buffer.allocUnsafe(0);
        }
        else if (v.toArray) {
            // converts a BN to a Buffer
            v = Buffer.from(v.toArray());
        }
        else {
            throw new Error('invalid type');
        }
    }
    return v;
}
exports.toBuffer = toBuffer;
function bufferToHex(buffer) {
    return addHexPrefix(toBuffer(buffer).toString('hex'));
}
exports.bufferToHex = bufferToHex;
function hexToString(str) {
    // remove additional 0x prefix
    if (str.startsWith('0x')) {
        str = str.substring(2);
    }
    const buf = Buffer.from(str, 'hex');
    return buf.toString('utf8');
}
exports.hexToString = hexToString;
//# sourceMappingURL=hex.js.map