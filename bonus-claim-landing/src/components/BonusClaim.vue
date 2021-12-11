<template>
  <div style="position: relative">
  <h1>Bonus Rewards</h1>
  <div><b>+</b></div>
  <h1>NFT Genesis Badge</h1>
  <p style="position: relative; top: -1rem;">by <a href="https://twitter.com/Cre8vDane" target="_blank">0xDane.eth</a> </p>
  <div if="isConnected" class="block">
      <h2 v-if="isConnected && !falseNetwork">Connected with: <span class="purple">{{ truncatedAddress }}</span> on <span class="purple">{{ $store.getters.getNetwork.name }}</span></h2>
      <h2 v-else-if="falseNetwork">Wrong network detected. Please change your network to either Ethereum or Polygon</h2>
      <h2 v-else>Please connect to the Ethereum or Polygon Network.</h2>
      <button v-if="!isConnected" id="claim" @click="initiateConnection">Connect wallet</button>
  </div>

  <div id="eligibility-status">
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
	<br>
    <div id="intro">
   </div>
    <div v-if="!claimSucceeded" id="claimable" class="block">
      <h1>Rewards Available</h1>
      <!-- <h2>+Genesis NFT Badge</h2> -->
      <h1><input v-model="claimAmount" type="number" /></h1>
      <h1>$HDAO</h1>
      <br/>
      <div>*Genesis Badge will automatically mint when you claim rewards.</div>
      <button v-if="isEligible" id="claim" @click="processClaim">Claim bonus</button>
      <!-- <button id="claim" @click="checkClaim">Check Claim</button> -->
    </div>
    <div v-if="claimSucceeded" id="congrats" class="block">
      <h1>Congratulations!</h1>
      <h3>You just recieved:</h3>
      <h1><input v-model="claimAmount" type="number" /> $HDAO</h1>
      <h2>plus your very own humanDAO NFT Genesis Badge!</h2>
      <h1>🤜🤛</h1>
    </div>

    <br/>
    <br/>
    <!-- //
    <button @click="initiateConnection">Connect wallet</button>
    <button @click="endConnection">Disconnect wallet</button>
    <div>ChainId: {{ $store.state.web3.networkId }}</div>
    <div>WalletId: {{ $store.state.web3.walletId }}</div>
    <div>Connected to: {{ $store.getters.getNetwork }} </div>
    <br/>
    <br/>
    //-->
    
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
      // Converting claim here to allow the full amount to remain intact so it can be used for the contract call
      let amount = this.$store.state.claimAmount / 1000000000000n // remove most decimals 
      return parseInt(amount) / 1000000 // convert to int to allow a result with decimals 
    },
    isConnected() {
      return !!this.$store.state.web3.walletId
    },
    unknownEligibility() {
      return this.$store.state.web3.claimStatus === ClaimStatus.Unknown
    },
    notEligible() {
      return this.$store.state.web3.claimStatus === ClaimStatus.CannotClaim
    },
    isEligible() {
      // return this.$store.state.web3.claimStatus === ClaimStatus.CanClaim
      return true
    },
    checkingClaim() {
      return this.$store.state.web3.claimStatus === ClaimStatus.Verifying
    },
    doingClaim() {
      return this.$store.state.web3.claimStatus === ClaimStatus.Processing
    },
    claimSucceeded() {
      return this.$store.state.web3.claimStatus === ClaimStatus.ClaimDone
    },
    hasClaimed() {
      return this.$store.state.web3.claimStatus === ClaimStatus.HasClaimed
    },
    claimFailed() {
      return this.$store.state.web3.claimStatus === ClaimStatus.ClaimFailed
    },
    userRejected() {
      return this.$store.state.web3.claimStatus === ClaimStatus.UserRejected
    },
    falseNetwork() {
      return this.isConnected && !this.$store.state.web3.correctNetwork
    },
    truncatedAddress() {
      let address = this.$store.state.web3.walletId
      return address.substring(0, 6) + '...' + address.substring(38, 42);
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
</style>