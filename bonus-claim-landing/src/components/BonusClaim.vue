<template>
  <div style="position: relative">
    <h1>Bonus Rewards</h1>
    <div><b>+</b></div>
    <h1>NFT Genesis Badge</h1>
    <p style="position: relative; top: -1rem;">by <a href="https://twitter.com/Cre8vDane" target="_blank">0xDane.eth</a> </p>
    <div class="block">
        <h2 v-if="isConnected && liveNetwork">Connected with: <span class="purple">{{ truncatedAddress }}</span> on <span class="purple">{{ $store.getters.getNetwork.name }}</span></h2>
        <h2 v-else-if="isConnected && testNetwork">Connected with: <span class="purple">{{ truncatedAddress }}</span> on <span class="purple">{{ $store.getters.getNetwork.name }}</span><span v-if="testNetwork" style="color: darkred"> TEST NETWORK</span></h2>
        <h2 v-else-if="isConnected">Wrong network detected. <br/> Please change your network to either Ethereum or Polygon.</h2>
        <h2 v-else>Please connect to the Ethereum or Polygon Network.</h2>
        <button v-if="!isConnected" id="claim" @click="initiateConnection" style="margin-bottom: 0;">Connect wallet</button>
    </div>
    <div id="eligibility-status" class="block">
      Status:
      <span v-if="unknownEligibility"> ☝️ </span>
      <span v-else-if="checkingClaim">⌛</span>
      <span v-else-if="notEligible">⛔ Sorry... This wallet is not eligible for rewards.</span>
      <span v-else-if="doingClaim">⌛ Your claim is being processed. Please wait.</span>
      <span v-else-if="claimSucceeded">🎉 Your rewards have been succesfully claimed.</span>
      <span v-else-if="claimFailed">⛔ Sorry, the claiming of rewards failed due to a technical error. You could try again later or contact us for support.</span>
      <span v-else-if="hasClaimed">⛔ Rewards have already been claimed for this wallet.</span>
      <span v-else-if="userRejected">⛔ Claim aborted. The transaction was not confirmed.</span>
      <span v-else-if="isEligible">✔️ Congratz... This wallet is eligible for rewards.</span>
    </div>
    <div v-if="refillWallet" class="warning">
      <br/>
      The current amount of HDAO tokens in your wallet is less than what you bought originally.<br/>Your bonus is being calculated based on what you currenly hold.<br/>Consider refilling your wallet to claim the highest possible bonus.
    </div>
    <div id="intro">
    </div>
    <div v-if="!claimSucceeded && isEligible" id="claimable" class="block">
      <h1>Rewards Available</h1>
      <!-- <h2>+Genesis NFT Badge</h2> -->
      <h1><input v-model="claimAmount" type="number" /></h1>
      <h1>$HDAO</h1>
      <button v-if="isEligible" id="claim" @click="processClaim">Claim bonus</button>
      <div>*Genesis Badge will automatically mint when you claim rewards.</div>
      <div>**You may only perform this action once per network, if applicable.</div>
      <!-- <button id="claim" @click="checkClaim">Check Claim</button> -->
    </div>
    <div v-if="claimSucceeded" id="congrats" class="block">
      <h1>Congratulations!</h1>
      <h1>You just recieved:</h1>
      <h1><input v-model="claimAmount" type="number" /></h1>
      <h1>$HDAO</h1>
      <h2>+NFT Genesis Badge!</h2>
      <h1>🤜🤛</h1>
    </div>
    <div class="loader" v-if="doingClaim"></div>
  </div>

</template>

<script>
import { ClaimStatus } from '../util/enum'

export default {
  name: 'ClaimComponent',
  props: {
    msg: String
  },
  computed: {
    claimAmount() {
      // return parseInt(this.$store.state.claimAmount.div(1000000000000000000n)) // This returns whole amount using BigNumber from etehrs
      let amount = parseInt(this.$store.state.claimAmount.div(1000000000000000n)) // still 1000 times too big but we need that for rounding (works with ethers)
      return Math.round(amount / 10) / 100 // creates a single digit and rounds up that number (e.g. 3456.8 -> 3457) then divdes and shows two decimals with correct rounding 
      // this line works with web3.js BigNumber implementation return Math.round(amount) / 100 // .toNumber() === 0 ? 0 : this.$store.state.claimAmount.shiftedBy(-18).toFixed(4)
      // this and next line works with native BigInt implementatoin let amount = BigInt(this.$store.state.claimAmount) / 1000000000000n //eslint-disable-line  
      // return parseInt(amount) / 1000000 // convert to int to allow a result with some decimals 
    },
    isConnected() {
      return !!this.$store.state.web3.walletId
    },
    unknownEligibility() {
      return this.$store.state.claimStatus === ClaimStatus.Unknown
    },
    notEligible() {
      return this.$store.state.claimStatus === ClaimStatus.CannotClaim
    },
    isEligible() {
      return this.$store.state.claimStatus === ClaimStatus.CanClaim
    },
    checkingClaim() {
      return this.$store.state.claimStatus === ClaimStatus.Verifying
    },
    doingClaim() {
      return this.$store.state.claimStatus === ClaimStatus.Processing
    },
    claimSucceeded() {
      return this.$store.state.claimStatus === ClaimStatus.ClaimDone
    },
    hasClaimed() {
      return this.$store.state.claimStatus === ClaimStatus.HasClaimed
    },
    claimFailed() {
      return this.$store.state.claimStatus === ClaimStatus.ClaimFailed
    },
    userRejected() {
      return this.$store.state.claimStatus === ClaimStatus.UserRejected
    },
    liveNetwork() {
      console.log('is live network: ', this.$store.state.web3.liveNetwork)
      return this.$store.state.web3.liveNetwork
    },
    testNetwork() {
      console.log('is test network: ', this.$store.state.web3.testNetwork)
      return this.$store.state.web3.testNetwork
    },
    truncatedAddress() {
      let address = this.$store.state.web3.walletId
      return address.substring(0, 6) + '...' + address.substring(38, 42);
    },
    refillWallet() {
      return this.$store.state.refillWallet
    }
  },
  methods: {
    initiateConnection () {
      this.$store.dispatch('connectWallet')
    },
    endConnection () {
      this.$store.dispatch('disconnectWallet')
    },
    checkClaim () {
      this.$store.dispatch('findClaim')
    },
    processClaim() {
      this.$store.dispatch('processClaim', { wm: this })
    }
  }
}
</script>

<style scoped>
  .warning {
    font-size: 0.75em;
    font-style: italic;
    color: darkred;
  }
  .loader{  
    position: fixed;
    top: 0px;
    right: 0px;
    width: 100%;
    height: 100%;
    background-color: #40437278;
    background-image: url(/img/loading.4605b9d7.gif);
    background-size: 13rem;
    background-repeat: no-repeat;
    background-position: center;
  }  
  .block {
    margin: 1rem 0;
  }
</style>
