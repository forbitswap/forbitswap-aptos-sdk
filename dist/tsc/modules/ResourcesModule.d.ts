import { SDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
import { AptosEvent, AptosResource, AptosResourceType } from '../types/aptos';
export declare class ResourcesModule implements IModule {
    protected _sdk: SDK;
    get sdk(): SDK;
    constructor(sdk: SDK);
    fetchAccountResource<T = unknown>(accountAddress: string, resourceType: AptosResourceType, ledgerVersion?: bigint | number): Promise<AptosResource<T> | undefined>;
    fetchAccountResources<T = unknown>(accountAddress: string, ledgerVersion?: bigint | number): Promise<AptosResource<T>[] | undefined>;
    fetchLedgerInfo<T = unknown>(): Promise<T>;
    fetchTransactionByVersion<T = unknown>(txnVersion: bigint | number): Promise<T>;
    getEventsByEventHandle(address: string, eventHandleStruct: string, fieldName: string, query?: {
        start?: bigint | number;
        limit?: number;
    }): Promise<AptosEvent[]>;
}
