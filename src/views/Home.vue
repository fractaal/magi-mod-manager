<template>
  <div>
    <h1 v-if="mods.length > 0" style="margin-left: 3.5em;">Your Mods</h1>
    <WelcomeCard v-if="mods.length < 1" :appVersion="appVersion" :changeLogs="changeLogs"/> 
    <div style="max-height: 85vh; overflow-y: auto; display: flex; flex-direction: column;">
      <transition-group name="list" tag="div">
        <HomeCard v-for="mod in mods" :key="mod.id" :mod="mod"></HomeCard>
      </transition-group>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  props: {
      mods: Array,
      appVersion: String,
      changeLogs: Array,
      },
  components: {
    HomeCard: () => import('../components/HomeCard.vue'),
    WelcomeCard: () => import ('../components/WelcomeCard.vue'),
    //ChangeLogs: () => import('../components/ChangeLogs.vue')
  }
}
</script>
