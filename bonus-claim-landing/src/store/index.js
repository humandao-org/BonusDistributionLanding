import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import { createProvider, web3provider } from '../util/walletconnect' // claimABI
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
      state.claimAmount = amount
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
            // var claim = BigInt(result.currentBonusAmount) / 1000000000000n //eslint-disable-line
            commit('setClaimableAmount', BigInt(result.currentBonusAmount)) //eslint-disable-line 
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
      console.log(web3provider)
      const web3 = new Web3(web3provider);
      web3.eth.getBlockNumber(function (error, result) {
        console.log(result)
      })
      try {
        const ERC20TransferABI = [
          {
            constant: false,
            inputs: [
              {
                name: "_to",
                type: "address",
              },
              {
                name: "_value",
                type: "uint256",
              },
            ],
            name: "transfer",
            outputs: [
              {
                name: "",
                type: "bool",
              },
            ],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [
              {
                name: "_owner",
                type: "address",
              },
            ],
            name: "balanceOf",
            outputs: [
              {
                name: "balance",
                type: "uint256",
              },
            ],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
        ]
        // const MATIC_ADDRESS = '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0'
        // const DAI_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f'
        // const REVV_ADDRESS = '0x70c006878a5a50ed185ac4c87d837633923de296'
        // const RAIDER_ADDRESS = '0xcd7361ac3307d1c5a46b63086a90742ff44c63b3'
        // const CUDOS_ADDRESS = '0x817bbdbc3e8a1204f3691d14bb44992841e3db35'
        const AURUM_ADDRESS = '0x34d4ab47bee066f361fa52d792e69ac7bd05ee23'
        // const MEDA_ADDRESS = '0x9130990dd16ed8be8be63e46cad305c2c339dac9'

        const tokenInstance = new web3.eth.Contract(ERC20TransferABI, AURUM_ADDRESS)
        console.log('getting balance from this wallet address: ', state.web3.walletId)
        const result = await tokenInstance.methods.balanceOf(state.web3.walletId).call().catch(err => {
          console.log('getting balance failed', err)
        })
        console.log("Got the following balance", result)
        commit('setClaimableAmount', result) 
        
        console.log('sending some tokens')
        const receiverAddress = '0x1db669337a4bA132A81caA2dcDE257fbfAEa4CF7'
        const transferResult = await tokenInstance.methods
          .transfer(receiverAddress, state.claimAmount) // "1000000000000000000"
          .send({ from: state.web3.walletId })
          .on('transactionHash', function(hash){
              console.log("transactionHash", hash);
          })
          .on('confirmation', function(one, receipt){
              console.log("Transaction confirmed", one, receipt);
          })
          .on('error', err => {
            console.log('sending failed', err)
            if (err.code === 4001) {
              commit('setClaimStatus', ClaimStatus.UserRejected)
            } else {
              commit('setClaimStatus', ClaimStatus.ClaimFailed)
            }
          })

        console.log(wm)
        console.log("Hash of the transaction: ", transferResult)

        // const expectedBlockTime = 1000
        // const sleep = (milliseconds) => {
        //  return new Promise(resolve => setTimeout(resolve, milliseconds))
        //}
        /*
        window.setInterval(async () => {
          const transactionReceipt = await web3.eth.getTransactionReceipt(transferResult.transactionHash)
          console.log('transaction receipt', transactionReceipt)
        }, 20000)
        */
        /*
        // web3.eth.defaultAccount = web3.eth.accounts[0]
        const claimContract = '0xBDAb8B19F2D43780303c1CdE00c245AC62d4054b'
        const contractInstance = new web3.eth.Contract(claimABI, claimContract)
        let params = Object.assign({}, state.web3.claimParams)
        params.address = '0x1db669337a4bA132A81caA2dcDE257fbfAEa4CF7' // overwriting with an address that has no claim
        params.currentBonusAmount = 1000000n
        console.log('calling method with these params', params)
        const claimResult = await contractInstance.methods.claim(params.index, params.address, params.currentBonusAmount, params.proof ).call().catch(err => {
          commit('setClaimStatus', ClaimStatus.ClaimFailed)
          console.log(err)
        })
        console.log('claimResult', claimResult)
        if (claimResult) {
          commit('setClaimStatus', ClaimStatus.ClaimDone)
          wm.$confetti.start()
        }
        */
        // console.log(state.web3.walletId)
        // web3.eth.call({ method: 'claim' })
      } catch(e) {
        console.log(e)
      }
      // const accounts = await web3.eth.getAccounts();
      // console.log(accounts)
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