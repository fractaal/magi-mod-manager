import Vue from 'vue'
import App from './App.vue'
import router from './router'

// Icons
import { library } from '@fortawesome/fontawesome-svg-core';
import { faHome, faSearch, faTimes, faWindowMaximize, faWindowMinimize } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faHome, faSearch, faWindowMinimize, faWindowMaximize, faTimes)

// Modals
import VModal from 'vue-js-modal'

Vue.config.productionTip = false
Vue.use(VModal)

Vue.component("fai", FontAwesomeIcon);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
