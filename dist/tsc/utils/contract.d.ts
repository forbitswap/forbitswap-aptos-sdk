import { AptosResourceType } from '../types/aptos';
export declare function isSortedSymbols(symbolX: string, symbolY: string): boolean;
export declare function composeType(address: string, generics: AptosResourceType[]): AptosResourceType;
export declare function composeType(address: string, struct: string, generics?: AptosResourceType[]): AptosResourceType;
export declare function composeType(address: string, module: string, struct: string, generics?: AptosResourceType[]): AptosResourceType;
export declare function extractAddressFromType(type: string): string;
export declare function checkAptosType(type: string, options?: {
    leadingZero: boolean;
}): boolean;
