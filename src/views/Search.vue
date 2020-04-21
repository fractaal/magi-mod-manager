<template>
  <div>
    <span style="display: grid; grid-template-columns: auto auto auto auto;">
      <h1 style="margin-left: 3.5em;">Search</h1>
      <DropdownList/>
    </span>
    <br>
    <div style="max-height: 85vh; overflow-y: auto;">
      <span v-if="modSearchResults.length == 0">
        <div v-for="index in 10" :key="index" class="card shimmer" style="height: 5em;"></div>
      </span>
      <transition-group name="fade">
        <div v-if="modSearchResults[0].name == 'noresult'" style="height: 75vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <h1>We couldn't find "{{modSearchTerm}}". :(</h1>
        </div>
        <div v-for="modSearchResult in modSearchResults" :key="modSearchResult.id" class="card" style="display: grid; grid-template-columns: 3fr 1fr;">
          <div style="display: flex;" v-on:click="$eventHub.$emit('viewModDetails', modSearchResult)" class=" animate-hover">
            <img :src="modSearchResult.logo" style="height: 100px; width: 100px; object-fit: contain; margin-right:1em;">
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
import DropdownList from '@/components/DropdownList.vue'

export default {
  name: 'Home',
  props: {
    modSearchResults: Array,
    modSearchTerm: String,
  },
  components: {
    DropdownList,
  }
}
</script>
