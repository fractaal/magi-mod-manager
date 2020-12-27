<template>
  <div>
    <h1>SEARCH</h1>
    <br>
    <div class="list">
      <div v-if="shared.magi.searchResults.length == 0" class="list">
        <div v-for="index in 10" :key="index" class="list-item" style="animation: shimmer 0.5s infinite; background-color: rgba(255,255,255,0.25);">
        </div>
      </div>
      <list-item v-for="mod in shared.magi.searchResults" 
        :key="mod.id" 
        :content="mod.summary" 
        :image="mod.logo.thumbnailUrl" 
        :title="mod.name"
        :enabled="true">
        <magi-button icon="download" size="lg" @click="shared.magi.download(mod.id)"/>
      </list-item>
    </div>
  </div>
</template>

<script>
import MagiButton from '@/components/MagiButton.vue';
import shared from '../store';
import ListItem from '@/components/ListItem.vue';

export default {
  components: { MagiButton, ListItem },
  name: "Search",
  data() {
    return {
      shared
    };
  }
};
</script>