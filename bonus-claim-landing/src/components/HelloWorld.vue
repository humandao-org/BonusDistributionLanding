<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      For a guide and recipes on how to configure / customize this project,<br>
      check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>.
    </p>
    <div>ChainId: {{ $store.state.web3.networkId }}</div>
    <div>WalletId: {{ $store.state.web3.walletId }}</div>
    <div>Connected to: {{ $store.getters.getNetwork }} </div>
    <div>
      Show claim amount: <input v-model="claimAmount" type="number" />
    </div>
    <button @click="checkClaim">Check claim amount</button>
  </div>
</template>

<script>

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  beforeCreate () {
    console.log('calling action to initialize wallet')
    this.$store.dispatch('initializeWallet')
  },
  computed: {
    claimAmount() {
      return this.$store.state.claimAmount
    }
  },
  methods: {
    checkClaim () {
      this.$store.dispatch('findClaim')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
