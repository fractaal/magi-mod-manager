import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false
Vue.prototype.$eventHub = new Vue();

new Vue({
  router,
  store,
  render: h => h(App),
  created() {
    // Prevent blank screen
    this.$router.push('/')
  }
}).$mount('#app')
