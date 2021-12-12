import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import { createProvider, web3provider, claimABI } from '../util/walletconnect' // ERC20TransferABI
import { ClaimStatus } from '../util/enum'
import Web3 from "web3";
import { BigNumber } from 'bignumber.js';

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
    setWeb3Instance(state, web3) {
      console.log(web3)
      state.web3.web3Instance = { web3: web3 }
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
      state.claimAmount = new BigNumber(amount)
    },
    setClaimStatus(state, status) {
      state.web3.claimStatus = status
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
      const walletAddress =  state.web3.walletId // '0xc639D69168365CC56E203C59db1Cc9016cEbec4b' // Checking against an eligible wallet // 
      const network = getters.getNetwork
      if (walletAddress && network) {
        if (state.web3.correctNetwork) {
          commit('setClaimStatus', ClaimStatus.Verifying)
          const claimURL = `https://api.defitrack.io/humandao/bonus-distribution/${walletAddress}?network=${network.name.toUpperCase()}`
          const response = await fetch(claimURL)
          const result = await response.json()
          console.log('result of checking claim', result)
          if (result.beneficiary && !result.claimed) {
            // var claim = BigInt(result.currentBonusAmount) / 1000000000000n //eslint-disable-line
            // let big = new BigNumber(result.currentBonusAmount)
            // console.log(big)
            commit('setClaimableAmount', result.currentBonusAmount) //eslint-disable-line 
            //parseInt(claim) / 1000000) 
            commit('setClaimStatus', ClaimStatus.CanClaim)
            const { address, index, proof, currentBonusAmount } = result
            commit('setContractParams', { address, index, proof, currentBonusAmount })
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

    async processClaim({ commit, state }, { wm }) {
      commit('setClaimStatus', ClaimStatus.Processing)
      const web3 = new Web3(web3provider);
      web3.eth.getBlockNumber(function (error, result) {
        console.log(result)
      })
      try {

        /*
        // Testing contract flow by sending some tokens between wallets
        //
        console.log('sending some tokens')
        const AURUM_ADDRESS = '0x34d4ab47bee066f361fa52d792e69ac7bd05ee23'
        const tokenInstance = new web3.eth.Contract(ERC20TransferABI, AURUM_ADDRESS)
        console.log('getting balance from this wallet address: ', state.web3.walletId)
        const result = await tokenInstance.methods.balanceOf(state.web3.walletId).call().catch(err => {
          console.log('getting balance failed', err)
        })
        console.log("Got the following balance", result)
        commit('setClaimableAmount', result) //eslint-disable-line  

        const receiverAddress = '0x1db669337a4bA132A81caA2dcDE257fbfAEa4CF7'
        const claimResult = await tokenInstance.methods
          .transfer(receiverAddress, store.state.claimAmount) // state.claimAmount
          .send({ from: state.web3.walletId })
        */

        const claimContract = '0xBDAb8B19F2D43780303c1CdE00c245AC62d4054b'
        const contractInstance = new web3.eth.Contract(claimABI, claimContract)
        let params = Object.assign({}, state.web3.claimParams)
        params.address = '0x1db669337a4bA132A81caA2dcDE257fbfAEa4CF7' // overwriting with an address that has no claim to ensure I do not screw up my own claim by running this prematurely
        // params.currentBonusAmount = store.state.claimAmount
        params.maxBonusAmount = store.state.claimAmount
        console.log('calling method with these params', params)

        const claimResult = await contractInstance.methods.claim(params.index, params.address, params.maxBonusAmount, params.proof).call().catch(err => {
          commit('setClaimStatus', ClaimStatus.ClaimFailed)
          console.log(err)
        })
        console.log('claimResult', claimResult)
        console.log(wm)

        /*
        // This part uses `send()` and awaits mining
        // Also it checks contract for isClaimed state before it assumes claim is done
        let checkInProgress = false
        var claimResult = await contractInstance.methods.claim(params.index, params.address, params.maxBonusAmount, params.proof).send({ from: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe' })
          .on('transactionHash', function(hash){
              console.log("transactionHash", hash);
          })
          .on('confirmation', async function(count, receipt){
              console.log("Transaction confirmed", count, receipt);

              if (!checkInProgress) {
                checkInProgress = true // prevents this from being run each time a new block is mined and this call has not returned et
                const claimContract = '0xBDAb8B19F2D43780303c1CdE00c245AC62d4054b'
                const contractInstance = new web3.eth.Contract(claimABI, claimContract)
                let params = Object.assign({}, state.web3.claimParams)
                // console.log('calling method with these params', params)
                var isClaimedResult = await contractInstance.methods.isClaimed(params.index).call().catch(err => {
                  // commit('setClaimStatus', ClaimStatus.ClaimFailed)
                  console.log(err)
                })
                // isClaimedResult = true // Simulate true
                console.log('result of isClaimed call: ', isClaimedResult)
                if (isClaimedResult) {
                  console.log('we can show the baloons now')
                  commit('setClaimStatus', ClaimStatus.ClaimDone)
                  wm.$confetti.start()
                } else {
                  // Allow a new check on the contract to be made on next block confirmation
                  checkInProgress = false
                }
              }
          })
          .on('error', err => {
            console.log('sending failed', err)
            if (err.code === 4001) {
              commit('setClaimStatus', ClaimStatus.UserRejected)
            } else {
              commit('setClaimStatus', ClaimStatus.ClaimFailed)
            }
          })
          */
        console.log("Result of the claim call: ", claimResult)

      } catch(e) {
        console.error('claim failed and was not caught in expected error handler', e)
        commit('setClaimStatus', ClaimStatus.ClaimFailed)
      }

      /*
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
      */
    }
  }
})