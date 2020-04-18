<template>
  <div class="home">
    <div style="display: grid; grid-columns-template: 1fr; max-height: 85vh; overflow-y: auto;">
      <div v-if="modSearchResults.length == 0"><h1 class="card-padding shimmer">Searching...</h1></div>
      <transition-group name="fade">
        <div v-for="modSearchResult in modSearchResults" :key="modSearchResult.id" class="card animate-hover" style="display: flex;" v-on:click="$parent.$emit('viewModDetails', modSearchResult)">
          <img :src="modSearchResult.logo" style="margin-right:1em;">
          <div style="display: grid; grid-columns-template: 1fr;">
            <p style="font-size: 2em;">{{modSearchResult.name}}</p>
            <p>By <b>{{modSearchResult.owner}}</b></p>
            <p>{{modSearchResult.blurb}}</p>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  props: ["modSearchResults"]
}
</script>
