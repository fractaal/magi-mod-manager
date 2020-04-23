import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Search from '../views/Search.vue'
import ModDetails from '../views/ModDetails.vue'
import NewProfile from '../views/NewProfile.vue'
import ChangeProfile from '../views/ChangeProfile.vue'
import WelcomeCard from '../components/WelcomeCard.vue'
import ConfigureProfile from '../views/ConfigureProfile.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
  },
  {
    path: '/modDetails',
    name: 'Mod Details',
    component: ModDetails,
  },
  {
    path: '/newProfile',
    name: 'New Profile',
    component: NewProfile,
  },
  {
    path: '/changeProfile',
    name: 'Change Profile',
    component: ChangeProfile,
  },
  {
    path: '/configureProfile',
    name: 'Configure Profile',
    component: ConfigureProfile,
  },
  {
    path: '/Welcome',
    name: 'Welcome',
    component: WelcomeCard
  }
]

const router = new VueRouter({
  mode: process.env.IS_ELECTRON ? 'hash' : 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
