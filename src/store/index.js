import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import { createProvider, web3provider, claimABI } from '../util/walletconnect' // ERC20TransferABI
import { ClaimStatus } from '../util/enum'
import Web3 from "web3";
import { ethers } from 'ethers' // BigNumber
// import { BigNumber } from 'bignumber.js';
import { providers } from "ethers";

Vue.use(Vuex)

export const store = new Vuex.Store({
  strict: true,
  state,
  getters: {
    getNetwork: state => {
      let networkId = state.web3.networkId
      if (networkId) {
        const netWork = state.web3.networks.find(nw => nw.id === networkId)
        if (netWork) {
          return netWork          
        }
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
    setWeb3Instance(state, web3) {
      console.log(web3)
      state.web3.web3Instance = { web3: web3 }
    },
    setChainId(state, id) { 
      state.web3.networkId = id
      if (id === 1 || id === 137) {
        state.web3.liveNetwork = true
        state.web3.testNetwork = false
      } else if (id === 80001) {
        state.web3.liveNetwork = false
        state.web3.testNetwork = true
      } else {
        state.web3.liveNetwork = false
        state.web3.testNetwork = false
      }
    },
    setWalletId(state, id) {
      state.web3.walletId = id
    },
    setClaimableAmount(state, amount) {
      state.claimAmount = ethers.BigNumber.from(amount)
    },
    setClaimStatus(state, status) {
      state.claimStatus = status
    },
    setRefillStatus(state, payload) {
      state.refillWallet = payload
    },
    setContractParams(state, payload) {
      state.web3.claimParams = payload
    }
  },
  actions: {
    async connectWallet({ commit, dispatch }) {
      // Creates provider and starts connection
      const walletProvider = await createProvider()

      // Creates a web3 object using the providers 
      // Gets chain and wallet plus sets up change notifies
      const web3 = new Web3(walletProvider);

      // commit('setWeb3Instance', web3) results in buffer overrun
      // Also tried to commit the provider to state (to  be able to call the Disconnect method) but resulted in buffer overrun ???

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

    async disconnectWallet() { 
      await web3provider.disconnect()
    },

    async verifyClaim({ state, getters, commit }) {
      const walletAddress =  state.web3.walletId
      const network = getters.getNetwork
      console.log('network', network)
      if (walletAddress && network) {
        if (state.web3.liveNetwork || state.web3.testNetwork) {
          commit('setClaimStatus', ClaimStatus.Verifying)
          // this.$config
          const claimURLMumbai = `https://api.defitrack.io/humandao/bonus-distribution/${walletAddress}?network=POLYGON_MUMBAI`
          const claimURLLive = `https://api.defitrack.io/humandao/bonus-distribution/${walletAddress}?network=${network.name.toUpperCase()}`
          const claimURL = state.web3.testNetwork ? claimURLMumbai : claimURLLive
          try {
            const response = await fetch(claimURL)
            const result = await response.json()
            // console.log('result of checking claim', result)
            if (result.beneficiary && !result.claimed) {
              commit('setClaimableAmount', result.currentBonusAmount) //eslint-disable-line 
              commit('setRefillStatus', result.shouldFillUpBalance)
              commit('setClaimStatus', ClaimStatus.CanClaim)
              const { address, index, proof, maxBonusAmount } = result
              commit('setContractParams', { address, index, proof, maxBonusAmount }) //eslint-disable-line 
            } else if(result.claimed) {
              console.log('has already claimed', result)
              commit('setClaimStatus', ClaimStatus.HasClaimed)
            } else {
              console.log('could not verify claim', result)
              commit('setClaimStatus', ClaimStatus.CannotClaim)
            }
          } catch (err) {
            commit('setClaimStatus', ClaimStatus.VerificationFailed)
            console.log(err)
          }
        } else {
          console.log('not connected to correct network')
        }
      } else {
        console.log('do not have wallet and network')
      }
    },

    async processClaim({ commit, state, getters }, { wm }) {

      // Wrap with Web3Provider from ethers.js
      const web3 = new providers.Web3Provider(web3provider);

      try {

        const claimContractPolygon = '0x5d04ec89c918383fb0810f2ad6c956cb2e41b3db' // '0xBDAb8B19F2D43780303c1CdE00c245AC62d4054b' changed to deployed contract
        const claimContractEthereum = '0xD53b145739352c1BCc7079cDdA0cf6EDfbd8F015'
        const cliamContractMumbai = '0x7fcA16Cb535DEf014b8984e9AAE55f2c23DB8C2f'
        const liveContractAddress = getters.getNetwork.name === 'Ethereum' ? claimContractEthereum : getters.getNetwork.name === 'Polygon' ? claimContractPolygon : 'InvalidContractAddress'
        const claimContract = state.web3.testNetwork ? cliamContractMumbai : liveContractAddress
        console.log('claim contract', claimContract)
        const signer = web3.getSigner(0);
        const contractInstance = new ethers.Contract(claimContract, claimABI, signer)

        let params = Object.assign({}, state.web3.claimParams)
        // params.address = '0x1db669337a4bA132A81caA2dcDE257fbfAEa4CF7' // overwriting with an address that has no claim to ensure I do not screw up my own claim by running this prematurely
        console.log('calling method with these params', params)

        const transaction = await contractInstance.claim(params.index, params.address, params.maxBonusAmount, params.proof) 

        commit('setClaimStatus', ClaimStatus.Processing) // Start waiting state once transaction is started

        transaction.wait(3).then(async (receipt) => {
          console.log(receipt)
          var isClaimedResult = await contractInstance.isClaimed(params.index)
          if (isClaimedResult) {
            commit('setClaimStatus', ClaimStatus.ClaimDone)
            wm.$confetti.start()
          } else {
            // Transaction is mined but claim is not done. Not supposed to occur
            commit('setClaimStatus', ClaimStatus.ClaimFailed)
          }
        })

      } catch(err) {
        console.log(err)
        if (err.code === 4001) {
          commit('setClaimStatus', ClaimStatus.UserRejected)
        } else {
          commit('setClaimStatus', ClaimStatus.ClaimFailed)
        }
      }
    }
  }
})