<template>
  <div>
    <h1 style="margin-left: 3.5em;">Your Mods</h1>
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
  props: ["mods"],
  components: {
    HomeCard: () => import('../components/HomeCard.vue')
  }
}
</script>
