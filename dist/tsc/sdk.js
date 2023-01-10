"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SDK = exports.NetworkType = void 0;
const aptos_1 = require("aptos");
const SwapModule_1 = require("./modules/SwapModule");
const RouteModule_1 = require("./modules/RouteModule");
const ResourcesModule_1 = require("./modules/ResourcesModule");
var NetworkType;
(function (NetworkType) {
    NetworkType[NetworkType["Mainnet"] = 0] = "Mainnet";
    NetworkType[NetworkType["Devnet"] = 1] = "Devnet";
    NetworkType[NetworkType["Testnet"] = 2] = "Testnet";
})(NetworkType = exports.NetworkType || (exports.NetworkType = {}));
class SDK {
    /**
     * SDK constructor
     * @param nodeUrl string
     * @param networkType? NetworkType
     */
    constructor(nodeUrl, networkType) {
        const mainnetOptions = {
            nativeCoin: '0x1::aptos_coin::AptosCoin',
            modules: {
                Scripts: '0x3da41ea4c78d23d16966064bbe5dba40263a65200dc96973a673c66c4f999999::forbitswapV1',
                CoinInfo: '0x1::coin::CoinInfo',
                CoinStore: '0x1::coin::CoinStore',
                DeployerAddress: '0x3da41ea4c78d23d16966064bbe5dba40263a65200dc96973a673c66c4f999999',
                ResourceAccountAddress: '0xdda852480521e53601dacc70066a80020097b6db8fed4afd6e7773f5a97b6bf1',
            },
        };
        const devnetOptions = {
            nativeCoin: '0x1::aptos_coin::AptosCoin',
            modules: {
                Scripts: '0x3da41ea4c78d23d16966064bbe5dba40263a65200dc96973a673c66c4f999999::forbitswapV1',
                CoinInfo: '0x1::coin::CoinInfo',
                CoinStore: '0x1::coin::CoinStore',
                DeployerAddress: '0x3da41ea4c78d23d16966064bbe5dba40263a65200dc96973a673c66c4f999999',
                ResourceAccountAddress: '0xdda852480521e53601dacc70066a80020097b6db8fed4afd6e7773f5a97b6bf1',
            },
        };
        const testnetOptions = {
            nativeCoin: '0x1::aptos_coin::AptosCoin',
            modules: {
                Scripts: '0x3da41ea4c78d23d16966064bbe5dba40263a65200dc96973a673c66c4f999999::forbitswapV1',
                CoinInfo: '0x1::coin::CoinInfo',
                CoinStore: '0x1::coin::CoinStore',
                DeployerAddress: '0x3da41ea4c78d23d16966064bbe5dba40263a65200dc96973a673c66c4f999999',
                ResourceAccountAddress: '0xdda852480521e53601dacc70066a80020097b6db8fed4afd6e7773f5a97b6bf1',
            },
        };
        let networkOptions = mainnetOptions; // default network
        if (networkType == NetworkType.Mainnet)
            networkOptions = mainnetOptions;
        if (networkType == NetworkType.Devnet)
            networkOptions = devnetOptions;
        if (networkType == NetworkType.Testnet)
            networkOptions = testnetOptions;
        const options = {
            nodeUrl,
            networkOptions: networkOptions,
        };
        this._networkOptions = options.networkOptions;
        this._client = new aptos_1.AptosClient(options.nodeUrl);
        this._swap = new SwapModule_1.SwapModule(this);
        this._route = new RouteModule_1.RouteModule(this);
        this._resources = new ResourcesModule_1.ResourcesModule(this);
    }
    get swap() {
        return this._swap;
    }
    get route() {
        return this._route;
    }
    get resources() {
        return this._resources;
    }
    get client() {
        return this._client;
    }
    get networkOptions() {
        return this._networkOptions;
    }
}
exports.SDK = SDK;
//# sourceMappingURL=sdk.js.map