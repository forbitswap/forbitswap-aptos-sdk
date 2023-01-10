"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourcesModule = void 0;
const tslib_1 = require("tslib");
const is_1 = require("../utils/is");
class ResourcesModule {
    constructor(sdk) {
        this._sdk = sdk;
    }
    get sdk() {
        return this._sdk;
    }
    fetchAccountResource(accountAddress, resourceType, ledgerVersion) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this._sdk.client.getAccountResource(accountAddress, resourceType, { ledgerVersion: ledgerVersion });
                return response;
            }
            catch (e) {
                if ((0, is_1.isAxiosError)(e)) {
                    if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                        return undefined;
                    }
                }
                console.log(e);
                throw e;
            }
        });
    }
    fetchAccountResources(accountAddress, ledgerVersion) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this._sdk.client.getAccountResources(accountAddress, { ledgerVersion: ledgerVersion });
                return response;
            }
            catch (e) {
                if ((0, is_1.isAxiosError)(e)) {
                    if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                        return undefined;
                    }
                }
                throw e;
            }
        });
    }
    fetchLedgerInfo() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this._sdk.client.getLedgerInfo();
                return response;
            }
            catch (e) {
                console.log(e);
                throw e;
            }
        });
    }
    fetchTransactionByVersion(txnVersion) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this._sdk.client.getTransactionByVersion(txnVersion);
                return response;
            }
            catch (e) {
                console.log(e);
                throw e;
            }
        });
    }
    getEventsByEventHandle(address, eventHandleStruct, fieldName, query) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this._sdk.client.getEventsByEventHandle(address, eventHandleStruct, fieldName, query);
                return response;
            }
            catch (e) {
                console.log(e);
                throw e;
            }
        });
    }
}
exports.ResourcesModule = ResourcesModule;
//# sourceMappingURL=ResourcesModule.js.map