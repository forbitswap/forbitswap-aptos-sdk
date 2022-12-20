import { composeType } from './contract'

const LPCoinModule = 'LPCoinV1'
const LPCoinType = 'LPCoin'
const forbitSwapLiquidityPool = 'LiquidityPool'
const forbitSwapAdminData = 'AdminData'
const forbitSwapPairInfo = 'PairInfo'
const forbitSwapEvent = 'Events'

export function composeLPCoin(address: string, coin_x: string, coin_y: string) {
  return composeType(address, LPCoinModule, LPCoinType, [coin_x, coin_y])
}

export function composeLP(swapScript: string, coin_x: string, coin_y: string) {
  return composeType(swapScript, forbitSwapLiquidityPool, [coin_x, coin_y])
}

export function composeLPCoinType(address: string) {
  return composeType(address, LPCoinModule, LPCoinType)
}

export function composeSwapPoolData(swapScript: string) {
  return composeType(swapScript, forbitSwapAdminData)
}

export function composePairInfo(swapScript: string) {
  return composeType(swapScript, forbitSwapPairInfo)
}

export function composeCoinStore(coinStore: string, coinType: string) {
  return `${coinStore}<${coinType}>`
}

export function composeLiquidityPool(swapScript: string) {
  return composeType(swapScript, forbitSwapLiquidityPool)
}

export function composeSwapEvent(swapScript: string, coin_x: string, coin_y: string) {
  return composeType(swapScript, forbitSwapEvent, [coin_x, coin_y])
}
