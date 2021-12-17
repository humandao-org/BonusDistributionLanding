<template>
  <div id="app">
     <img v-if="!showNFT" id="logo" alt="humanDAO logo" src="https://img1.wsimg.com/isteam/ip/bcbef592-2bb5-44e7-85a8-79579c8e5ec3/1AA712D0-1DD9-4858-9923-3E7AA47FBFFF.png/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:300,h:300">
     <img v-else alt="humanDAO NFT Genesis Badge" width="300" src="./assets/nft.gif">
    <BonusClaim msg="hello humanDAO claim app ;-)"/>
    <div> 
      Made with 💜 by <a href="https://humandao.org/" target="_blank">HDAO</a>
    </div>
  </div>
</template>

<script>
import BonusClaim from './components/BonusClaim.vue'
import { ClaimStatus } from './util/enum.js'
export default {
  name: 'App',
  components: {
    BonusClaim
  },
  computed: {
    showNFT() {
      return this.$store.state.claimStatus === ClaimStatus.HasClaimed || this.$store.state.claimStatus === ClaimStatus.ClaimDone
    }
  }
}
</script>

<style>
body {
  margin:0 auto;
  background: white;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background: white;
  padding: 5em;
}
#logo {
  width: 100%;
  height: 100%;
  max-width: 300px;
}
h1 {
  margin:0;
}
h2 {
  margin: 0;
  font-size: 1em;
}
a {
  text-decoration: none;
}
input {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #75529d;
  padding:0;
  font-size: 1em;
  width: 13rem;
  border: none;
  pointer-events: none; 
  margin: 0.5rem 1rem;
}


.purple {
  color: #75529d;
}
.block {
  font-size: 1em;
}
input[type=number] {
  -moz-appearance: textfield;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input:focus {
  outline: none;
}
#claim, button {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color:#2c3e50;
  background:#d3b0fb;
  font-size: 1.5em;
  border-radius: 10px;
  border: solid 1px#2c3e50;
  margin: 1rem;
  padding: 0.5rem 1.5rem;
  cursor: pointer;
}

#claimable {
}
#not-claimable {
}
#intro {
}
#congrats {
}
</style>
