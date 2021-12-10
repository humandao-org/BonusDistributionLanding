let state = {
  web3: {
    isInjected: false, // not in use
    web3Instance: null, // not in use
    provider: null,
    networkId: null,
    walletId: null,
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