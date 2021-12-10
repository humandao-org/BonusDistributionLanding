import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import { createProvider } from '../util/walletconnect'
// import { connector } from '../util/walletconnect'
import Web3 from "web3";

Vue.use(Vuex)

export const store = new Vuex.Store({
  strict: true,
  state,
  getters: {
    getNetwork: state => {
      let networkId = state.web3.networkId
      if (networkId) {
      return state.web3.networks.find(nw => nw.id === networkId)
    }
    return { id: 0, name: 'none' }
    }
  },
  mutations: {
    setProvider(state, provider) {
      state.web3.provider = provider
    },
    clearProvider(state) {
      state.web3.provider = null
    },
    setChainId(state, id) { 
      state.web3.networkId = id
    },
    setWalletId(state, id) {
      state.web3.walletId = id
    },
    setClaimableAmount(state, amount) {
      state.claimAmount = amount
    }
  },
  actions: {
    async connectWallet({ commit }) {
      // Creates provider and starts connection
      const walletProvider = await createProvider()

      // Creates a web3 object using the providers 
      // Gets chain and wallet plus sets up change notifies
      const web3 = new Web3(walletProvider);

      // commit('setProvider', walletProvider) // Tried to commit this to state but resulted in buffer overrun ???

      const accounts = await web3.eth.getAccounts();
      const chain = await web3.eth.getChainId();
      commit('setChainId', chain)
      commit('setWalletId', accounts[0])

      walletProvider.on("chainChanged", (chainId) => {
        commit('setChainId', parseInt(chainId, 16)) // Getting the chain id hex notation
      });

      walletProvider.on("accountsChanged", (accounts) => {
        commit('setWalletId', accounts[0])
      });
      
      walletProvider.on("disconnect", (code, reason) => {
        console.log(code, reason);
      });
    },

    async disconnectWallet({ state, commit }) { 
      await state.web3.provider.disconnect()
      commit('clearProvider')
    },

    async findClaim({ state, getters, commit }) {
      const walletAddress =  state.web3.walletId 
      const network = getters.getNetwork
      if (walletAddress && network) {
        const claimURL = `https://api.defitrack.io/humandao/bonus-distribution/${walletAddress}?network=${network.name.toUpperCase()}`
        const response = await fetch(claimURL)
        const result = await response.json()
        if (result.beneficiary && !result.claimed) {
          var claim = BigInt(result.amount) / 1000000000000n //eslint-disable-line
          commit('setClaimableAmount', parseInt(claim) / 1000000) 
        } else {
          console.log('nothing to claim', result)
        }
      } else {
        console.log('do not have wallet and network')
      }
    } 

  },
})