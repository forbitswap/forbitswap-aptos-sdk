export declare type address = string;
export declare type AptosResourceType = string;
export declare type AptosResource<T = unknown> = {
    data: T;
    type: string;
};
export declare type AptosCoinInfoResource = {
    decimals: number;
    name: string;
    supply: {
        vec: [
            {
                aggregator: {
                    vec: [
                        {
                            handle: address;
                            key: address;
                            limit: string;
                        }
                    ];
                };
                integer: {
                    vec: [
                        {
                            limit: string;
                            value: string;
                        }
                    ];
                };
            }
        ];
    };
    symbol: string;
};
export declare type AptosCoinStoreResource = {
    coin: {
        value: string;
    };
    deposit_events: {
        counter: string;
        guid: {
            id: {
                addr: address;
                creation_num: string;
            };
        };
    };
    frozen: boolean;
    withdraw_events: {
        counter: string;
        guid: {
            id: {
                addr: address;
                creation_num: string;
            };
        };
    };
};
export declare type AptosTypeInfo = {
    account_address: AptosResourceType;
    module_name: AptosResourceType;
    struct_name: AptosResourceType;
};
export declare type EntryFunctionPayload = {
    type: 'entry_function_payload';
    function: string;
    type_arguments: string[];
    arguments: string[];
};
export declare type Payload = EntryFunctionPayload;
export declare type AptosCreateTx = {
    sender: string;
    maxGasAmount: string;
    gasUnitPrice: string;
    gasCurrencyCode: string;
    expiration: string;
    payload: Payload;
};
export declare type AptosLedgerInfo = {
    chain_id: number;
    epoch: string;
    ledger_version: string;
    ledger_timestamp: string;
    oldest_ledger_version: string;
    block_height: string;
    oldest_block_height: string;
};
export declare type AptosTransaction = {
    version: string;
    hash: string;
    state_change_hash: string;
    event_root_hash: string;
    state_checkpoint_hash?: string;
    gas_used: string;
    success: boolean;
    vm_status: string;
    accumulator_root_hash: string;
    timestamp: string;
};
export declare type AptosEvent = {
    key: string;
    version: string;
    sequence_number: string;
    type: string;
    data: any;
};
