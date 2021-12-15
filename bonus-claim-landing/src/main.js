import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex';
import { store } from './store/'
import VueConfetti from 'vue-confetti'
// import VueSpinner from 'vue-spinner/dist/vue-spinner.min.js'

Vue.config.productionTip = false

// const GridLoader = VueSpinner.GridLoader
// Vue.use(GridLoader)
// Vue.component('GridLoader', GridLoader)
Vue.use(VueConfetti)
Vue.use(Vuex)

fetch(process.env.BASE_URL + "config.json")
  .then((response) => response.json())
  .then((config) => {
       Vue.prototype.$config = config
       new Vue({
        //components: {
        //  GridLoader
        //},
        store,
        render: h => h(App),
      }).$mount('#app')
   })

