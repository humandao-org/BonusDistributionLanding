import { ClaimStatus } from '../util/enum'
import { BigNumber } from 'bignumber.js';

let state = {
  web3: {
    isInjected: false, // not in use
    web3Instance: null,
    liveNetwork: false,
    testNetwork: false,
    networkId: null,
    walletId: null,
    error: null,
    networks: [
      { id: 1, name: 'Ethereum' },
      { id: 56, name: 'Binance Smart Chain' },
      { id: 137, name: 'Polygon' },
      { id: 80001, name: 'Mumbai' }
    ],
    claimParams: {}
  },
  claimAmount: new BigNumber(0),
  refillWallet: false,
  claimStatus: ClaimStatus.Unknown,
}

export default state