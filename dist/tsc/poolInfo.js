"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoinPairSwapEvents = exports.parseAllLPCoins = void 0;
const tslib_1 = require("tslib");
const sdk_1 = require("./sdk");
const utils_1 = require("./utils");
const sdk = new sdk_1.SDK('https://fullnode.mainnet.aptoslabs.com', sdk_1.NetworkType.Mainnet);
// const sdk = new SDK('https://fullnode.testnet.aptoslabs.com', NetworkType.Testnet)
const coin2Reserve = {};
function parseAllLPCoins() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // lpCoin apr, maybe NaN if pair not exist at the given ledger version
        // LPCoinsAPR: { [key: string]: { [key: string]: Decimal } }
        const LPCoinsAPRTask = sdk.swap.getLPCoinAPYBatch((0, utils_1.d)(2e6));
        // get all lp coins
        const allLPTask = sdk.swap.getAllLPCoinResourcesWithAdmin();
        const [LPCoinsAPR, allLP] = yield Promise.all([LPCoinsAPRTask, allLPTask]);
        // console.log(`APR window second: ${LPCoinsAPR.windowSeconds}`)
        const allLPCoins = allLP.filter(utils_1.notEmpty).map(element => {
            const apr = LPCoinsAPR.apys[`${element.coinX}, ${element.coinY}`];
            const ret = {
                coinX: element.coinX,
                coinY: element.coinY,
                coinXReserve: element.coinXReserve,
                coinYReserve: element.coinYReserve,
                apr,
            };
            return ret;
        });
        // get all coin reserves
        allLPCoins.forEach(element => {
            if (coin2Reserve[element.coinX]) {
                coin2Reserve[element.coinX] = coin2Reserve[element.coinX].add((0, utils_1.d)(element.coinXReserve));
            }
            else {
                coin2Reserve[element.coinX] = (0, utils_1.d)(element.coinXReserve);
            }
            if (coin2Reserve[element.coinY]) {
                coin2Reserve[element.coinY] = coin2Reserve[element.coinY].add((0, utils_1.d)(element.coinYReserve));
            }
            else {
                coin2Reserve[element.coinY] = (0, utils_1.d)(element.coinYReserve);
            }
        });
    });
}
exports.parseAllLPCoins = parseAllLPCoins;
function getCoinPairSwapEvents(coinPair, startVersion) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const batchSize = 100; // for rpc api, Max batch size is 100. More than 100 will take bug
        const allEvents = [];
        let eventParams = {
            coinPair: coinPair,
            fieldName: 'swap_event',
            query: {
                limit: batchSize,
            },
        };
        let events = yield sdk.swap.getEvents(eventParams);
        allEvents.push(...events.filter(v => (0, utils_1.d)(v.version).gt((0, utils_1.d)(startVersion))));
        console.log(allEvents.length);
        while ((0, utils_1.d)(events[0].sequence_number).gt(0)
            && (0, utils_1.d)(events[0].version).gt((0, utils_1.d)(startVersion))) {
            // the api is strange, cannot use reverse start, so we do it like this
            // you can only give the start sequence_number, so the next batch start should be `Max(events[0].sequence_number - batchSize, 0)`
            let start = BigInt(events[0].sequence_number) - BigInt(batchSize);
            const limit = start > BigInt(0) ? batchSize : batchSize + Number((start - BigInt(0)));
            start = start > BigInt(0) ? start : BigInt(0);
            eventParams = {
                coinPair: coinPair,
                fieldName: 'swap_event',
                query: {
                    start: start,
                    limit: limit,
                },
            };
            events = yield sdk.swap.getEvents(eventParams);
            allEvents.push(...events.filter(v => (0, utils_1.d)(v.version).gt((0, utils_1.d)(startVersion))));
        }
        const swapEventsGroup = {
            coinXIn: (0, utils_1.d)(0),
            coinXOut: (0, utils_1.d)(0),
            coinYIn: (0, utils_1.d)(0),
            coinYOut: (0, utils_1.d)(0),
            number: 0,
        };
        allEvents.forEach(v => {
            swapEventsGroup.coinXIn = swapEventsGroup.coinXIn.add(v.data.amount_x_in);
            swapEventsGroup.coinXOut = swapEventsGroup.coinXOut.add(v.data.amount_x_out);
            swapEventsGroup.coinYIn = swapEventsGroup.coinYIn.add(v.data.amount_y_in);
            swapEventsGroup.coinYOut = swapEventsGroup.coinYOut.add(v.data.amount_y_out);
            swapEventsGroup.number++;
        });
        console.log(swapEventsGroup);
        return swapEventsGroup;
    });
}
exports.getCoinPairSwapEvents = getCoinPairSwapEvents;
parseAllLPCoins();
//# sourceMappingURL=poolInfo.js.map