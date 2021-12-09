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
      console.log('get network using id: ', networkId)
      if (networkId) {
      return state.web3.networks.find(nw => nw.id === networkId)
    }
    return { id: 0, name: 'none' }
    }
  },
  mutations: {
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
    async initializeWallet({ commit }) {
      console.log('calling action', createProvider)
      // const result = await web3.enable();
      const provider = await createProvider()
      console.log('obtained provider: ', provider)


        // Subscribe to chainId change
      provider.on("chainChanged", (chainId) => {
        console.log('chain changed to: ', chainId);
        commit('setChainId', parseInt(chainId, 16)) // Getting the chain id hex notation
      });

      // regular web3 provider methods
      const web3 = new Web3(provider);
      console.log('after calling new Web3', web3)

      const accounts = await web3.eth.getAccounts();
      const chain = await web3.eth.getChainId();
      commit('setChainId', chain)
      commit('setWalletId', accounts[0])
      console.log(accounts);
      console.log(chain)
    },
    async findClaim({ state, getters, commit }) {
      const walletAddress =  state.web3.walletId 
      const network = getters.getNetwork
      if (walletAddress && network) {
        const claimURL = `https://api.defitrack.io/humandao/bonus-distribution/${walletAddress}?network=${network.name.toUpperCase()}`
        console.log(claimURL)
        const response = await fetch(claimURL)
        const result = await response.json()
        if (result.beneficiary && !result.claimed) {
          console.log(result.amount)
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