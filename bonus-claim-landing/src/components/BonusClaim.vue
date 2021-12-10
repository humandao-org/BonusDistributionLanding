<template>
  <div>
    <h1>humanDAO</h1>
    <div>Claim your bonus and your genesis NFT here!</div>
    <br/>
    <br/>
    <button @click="initiateConnection">Connect wallet</button>
    <!-- <button @click="endConnection">Disconnect wallet</button> -->
    <div>ChainId: {{ $store.state.web3.networkId }}</div>
    <div>WalletId: {{ $store.state.web3.walletId }}</div>
    <div>Connected to: {{ $store.getters.getNetwork }} </div>
    <br/>
    <br/>
    <div>
      Show claim amount: <input v-model="claimAmount" type="number" />
    </div>
    <button @click="checkClaim">Check claim amount</button>
  </div>
</template>

<script>

export default {
  name: 'ClaimComponent',
  props: {
    msg: String
  },
  // beforeCreate() {
    // this.$store.dispatch('connectWallet')
  // },
  computed: {
    claimAmount() {
      return this.$store.state.claimAmount
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
    }
  }
}
</script>

<style scoped>

</style>
