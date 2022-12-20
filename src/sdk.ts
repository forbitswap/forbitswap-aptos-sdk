import { AptosClient } from 'aptos'
import { SwapModule } from './modules/SwapModule'
import { RouteModule } from './modules/RouteModule'
import { ResourcesModule } from './modules/ResourcesModule'
import { AptosResourceType } from './types/aptos'

export type SdkOptions = {
  nodeUrl: string
  networkOptions: {
    nativeCoin: AptosResourceType
    modules: {
      CoinInfo: AptosResourceType
      CoinStore: AptosResourceType
      Scripts: AptosResourceType
      ResourceAccountAddress: AptosResourceType
      DeployerAddress: AptosResourceType
    } & Record<string, AptosResourceType>
  }
}

export enum NetworkType {
  Mainnet,
  Devnet,
  Testnet,
}

export class SDK {
  protected _client: AptosClient
  protected _swap: SwapModule
  protected _route: RouteModule
  protected _resources: ResourcesModule
  protected _networkOptions: SdkOptions['networkOptions']

  get swap() {
    return this._swap
  }

  get route() {
    return this._route
  }

  get resources() {
    return this._resources
  }

  get client() {
    return this._client
  }

  get networkOptions() {
    return this._networkOptions
  }

  /**
   * SDK constructor
   * @param nodeUrl string
   * @param networkType? NetworkType
   */
  constructor(nodeUrl: string, networkType?: NetworkType) {
    const mainnetOptions = {
      nativeCoin: '0x1::aptos_coin::AptosCoin',
      modules: {
        Scripts: '0xa3b854a301bf4d44b6bbeb3354e50c94ab1b5cc82dd1e03a325cbd06a24e94b9::forbitSwapV1',
        CoinInfo: '0x1::coin::CoinInfo',
        CoinStore: '0x1::coin::CoinStore',
        DeployerAddress: '0xa3b854a301bf4d44b6bbeb3354e50c94ab1b5cc82dd1e03a325cbd06a24e94b9',
        ResourceAccountAddress: '0x839caa18bb03bc24f651e3426d8f95a4020b7fc68a3e2f3576c4452baf0f69ff',
      },
    }
    const devnetOptions = {
      nativeCoin: '0x1::aptos_coin::AptosCoin',
      modules: {
        Scripts: '0xa3b854a301bf4d44b6bbeb3354e50c94ab1b5cc82dd1e03a325cbd06a24e94b9::forbitSwapV1',
        CoinInfo: '0x1::coin::CoinInfo',
        CoinStore: '0x1::coin::CoinStore',
        DeployerAddress: '0xa3b854a301bf4d44b6bbeb3354e50c94ab1b5cc82dd1e03a325cbd06a24e94b9',
        ResourceAccountAddress: '0x839caa18bb03bc24f651e3426d8f95a4020b7fc68a3e2f3576c4452baf0f69ff',
      },
    }
    const testnetOptions = {
      nativeCoin: '0x1::aptos_coin::AptosCoin',
      modules: {
        Scripts: '0xa3b854a301bf4d44b6bbeb3354e50c94ab1b5cc82dd1e03a325cbd06a24e94b9::forbitSwapV1',
        CoinInfo: '0x1::coin::CoinInfo',
        CoinStore: '0x1::coin::CoinStore',
        DeployerAddress: '0xa3b854a301bf4d44b6bbeb3354e50c94ab1b5cc82dd1e03a325cbd06a24e94b9',
        ResourceAccountAddress: '0x839caa18bb03bc24f651e3426d8f95a4020b7fc68a3e2f3576c4452baf0f69ff',
      },
    }
    let networkOptions = mainnetOptions  // default network
    if (networkType == NetworkType.Mainnet) networkOptions = mainnetOptions
    if (networkType == NetworkType.Devnet) networkOptions = devnetOptions
    if (networkType == NetworkType.Testnet) networkOptions = testnetOptions
    const options = {
      nodeUrl,
      networkOptions: networkOptions,
    }
    this._networkOptions = options.networkOptions
    this._client = new AptosClient(options.nodeUrl)
    this._swap = new SwapModule(this)
    this._route = new RouteModule(this)
    this._resources = new ResourcesModule(this)
  }
}
