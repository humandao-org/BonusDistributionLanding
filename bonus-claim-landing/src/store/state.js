import { ClaimStatus } from '../util/enum'

let state = {
  web3: {
    isInjected: false, // not in use
    web3Instance: null,
    correctNetwork: false,
    networkId: null,
    walletId: null,
    error: null,
    claimStatus: ClaimStatus.Unknown,
    networks: [
      { id: 1, name: 'Ethereum' },
      { id: 56, name: 'Binance Smart Chain' },
      { id: 137, name: 'Polygon' }
    ],
    claimParams: {}
  },
  claimAmount: 0
}

export default state