<template>
  <div id="app">
    <img alt="Vue logo" src="https://img1.wsimg.com/isteam/ip/bcbef592-2bb5-44e7-85a8-79579c8e5ec3/1AA712D0-1DD9-4858-9923-3E7AA47FBFFF.png/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:300,h:300">
    <BonusClaim msg="hello claim app"/>
  </div>
</template>

<script>
import BonusClaim from './components/BonusClaim.vue'

export default {
  name: 'App',
  components: {
    BonusClaim
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
