<template>
  <div>
    <h1 style="margin-left: 3.5em;">Your Mods</h1>
    <div style="max-height: 85vh; overflow-y: auto;">
      <HomeCard v-for="mod in mods" :key="mod.id" :mod="mod"></HomeCard>
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
