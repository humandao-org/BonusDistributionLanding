let state = {
  web3: {
    isInjected: false,
    web3Instance: null,
    networkId: null,
    walletId: null,
    coinbase: null,
    balance: null,
    error: null,
    networks: [
      { id: 1, name: 'Ethereum' },
      { id: 56, name: 'Binance Smart Chain' },
      { id: 137, name: 'Polygon' }
    ]
  },
  claimAmount: 0
}
export default state