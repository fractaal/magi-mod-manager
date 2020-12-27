<template>
  <div>
    <h1>YOUR MODS</h1>
    <br>
    <div class="list">
      <list-item v-for="mod in shared.magi.profileManager.activeProfile.mods"
      :key="mod.id"
      :title="mod.name"
      :image="mod.pictureUrl"
      :content="mod.summary"
      :enabled="mod.active"
      >
      <magi-button icon="power-off" size="lg" @click="mod.toggle()"/>
      </list-item>
    </div>
  </div>
</template>

<script>
import ListItem from '@/components/ListItem.vue';
import MagiButton from '@/components/MagiButton.vue';

import shared from '../store';

export default {
  components: { ListItem, MagiButton },
  name: "Home",
  data() {
    return {
      shared
    };
  },
};
</script>