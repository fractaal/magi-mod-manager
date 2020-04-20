<template>
  <div>
    <h1 style="margin-left: 3.5em;">Search</h1>
    <div style="display: grid; grid-columns-template: 1fr; max-height: 85vh; overflow-y: auto;">
      <span v-if="modSearchResults.length == 0">
        <div v-for="index in 10" :key="index" class="card shimmer" style="height: 5em;"></div>
      </span>
      
      <transition-group name="fade">
        <div v-for="modSearchResult in modSearchResults" :key="modSearchResult.id" class="card" style="display: grid; grid-template-columns: 3fr 1fr;">
          <div style="display: flex;" v-on:click="$eventHub.$emit('viewModDetails', modSearchResult)" class=" animate-hover">
            <img :src="modSearchResult.logo" style="margin-right:1em;">
            <div style="display: grid; grid-columns-template: 1fr;">
              <p style="font-size: 2em;">{{modSearchResult.name}}</p>
              <p>By <b>{{modSearchResult.owner}}</b></p>
              <p>{{modSearchResult.blurb}}</p>
            </div>
          </div>
          <span class="hover-shine" v-on:click="$eventHub.$emit('startDownload', modSearchResult)">
            <i style="display: flex; justify-content: center;" class="fa fa-arrow-circle-down fa-4x"></i>
            <h4 style="display: flex; justify-content: center;">Download</h4>
          </span>
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
