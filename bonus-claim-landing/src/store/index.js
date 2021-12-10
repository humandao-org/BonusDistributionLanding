import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import { createProvider } from '../util/walletconnect'
import { ClaimStatus } from '../util/enum'
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
      if (id === 1 || id === 137) {
        state.web3.correctNetwork = true
      } else {
        state.web3.correctNetwork = false
      }
    },
    setWalletId(state, id) {
      state.web3.walletId = id
    },
    setClaimableAmount(state, amount) {
      state.claimAmount = amount
    },
    setClaimStatus(state, status) {
      state.web3.claimStatus = status
    }
  },
  actions: {
    async connectWallet({ commit, dispatch }) {
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
      dispatch('verifyClaim')

      walletProvider.on("chainChanged", (chainId) => {
        commit('setChainId', parseInt(chainId, 16)) // Getting the chain id hex notation
        commit('setClaimableAmount', 0) 
        commit('setClaimStatus', ClaimStatus.Unknown)
        dispatch('verifyClaim')
      });

      walletProvider.on("accountsChanged", (accounts) => {
        commit('setWalletId', accounts[0])
        commit('setClaimableAmount', 0) 
        commit('setClaimStatus', ClaimStatus.Unknown)
        dispatch('verifyClaim')
      });
      
      walletProvider.on("disconnect", (code, reason) => {
        console.log(code, reason);
      });
    },

    async disconnectWallet({ state, commit }) { 
      await state.web3.provider.disconnect()
      commit('clearProvider')
    },

    async verifyClaim({ state, getters, commit }) {
      const walletAddress =  state.web3.walletId 
      const network = getters.getNetwork
      if (walletAddress && network) {
        if (state.web3.correctNetwork) {
          commit('setClaimStatus', ClaimStatus.Verifying)
          const claimURL = `https://api.defitrack.io/humandao/bonus-distribution/${walletAddress}?network=${network.name.toUpperCase()}`
          const response = await fetch(claimURL)
          const result = await response.json()
          console.log('result of checking claim', result)
          if (result.beneficiary && !result.claimed) {
            var claim = BigInt(result.amount) / 1000000000000n //eslint-disable-line
            commit('setClaimableAmount', parseInt(claim) / 1000000) 
            commit('setClaimStatus', ClaimStatus.CanClaim)
          } else if(result.claimed) {
            console.log('has already claimed', result)
            commit('setClaimStatus', ClaimStatus.HasClaimed)
          } else {
            console.log('could not verify claim', result)
            commit('setClaimStatus', ClaimStatus.CannotClaim)
          }
        } else {
          console.log('not connected to correct network')
        }
      } else {
        console.log('do not have wallet and network')
      }
    },

    async processClaim(context, { wm }) {
      context.commit('setClaimStatus', ClaimStatus.Processing)
      console.log('got vm?', wm)
      window.setTimeout(() => {
        context.commit('setClaimStatus', ClaimStatus.ClaimDone)
        wm.$confetti.start()
        wm.$confetti.update({
          particles: [
            {
              type: 'heart',
            },
            {
              type: 'circle',
            },
          ],
        });
      }, 2000)
    }

  },
})