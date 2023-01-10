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
        Scripts: '0x3da41ea4c78d23d16966064bbe5dba40263a65200dc96973a673c66c4f999999::forbitswapV1',
        CoinInfo: '0x1::coin::CoinInfo',
        CoinStore: '0x1::coin::CoinStore',
        DeployerAddress: '0x3da41ea4c78d23d16966064bbe5dba40263a65200dc96973a673c66c4f999999',
        ResourceAccountAddress: '0xdda852480521e53601dacc70066a80020097b6db8fed4afd6e7773f5a97b6bf1',
      },
    }
    const devnetOptions = {
      nativeCoin: '0x1::aptos_coin::AptosCoin',
      modules: {
        Scripts: '0x3da41ea4c78d23d16966064bbe5dba40263a65200dc96973a673c66c4f999999::forbitswapV1',
        CoinInfo: '0x1::coin::CoinInfo',
        CoinStore: '0x1::coin::CoinStore',
        DeployerAddress: '0x3da41ea4c78d23d16966064bbe5dba40263a65200dc96973a673c66c4f999999',
        ResourceAccountAddress: '0xdda852480521e53601dacc70066a80020097b6db8fed4afd6e7773f5a97b6bf1',
      },
    }
    const testnetOptions = {
      nativeCoin: '0x1::aptos_coin::AptosCoin',
      modules: {
        Scripts: '0x3da41ea4c78d23d16966064bbe5dba40263a65200dc96973a673c66c4f999999::forbitswapV1',
        CoinInfo: '0x1::coin::CoinInfo',
        CoinStore: '0x1::coin::CoinStore',
        DeployerAddress: '0x3da41ea4c78d23d16966064bbe5dba40263a65200dc96973a673c66c4f999999',
        ResourceAccountAddress: '0xdda852480521e53601dacc70066a80020097b6db8fed4afd6e7773f5a97b6bf1',
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
