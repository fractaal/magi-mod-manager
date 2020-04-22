<template>
  <div>
    <span style="display: flex;">
      <h1 style="margin-left: 2em; margin-right: 2em;">Search</h1>
      <SearchDropdownList label="Version" :list="refinedSearchFiltersTemplate.minecraftVersions" type="mc_version" :activeProfileVersion="activeProfileVersion"/>
    </span>
    <br>
    <div style="max-height: 85vh; overflow-y: auto;">
      <span v-if="modSearchResults.length == 0 && !noResultFound">
        <div v-for="index in 10" :key="index" class="card shimmer" style="height: 5em;"></div>
      </span>
      <transition name="name">
        <div v-if="noResultFound" style="height: 75vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <h1>We couldn't find that mod. Try searching for something else! :(</h1>
        </div>
      </transition>
      <transition-group name="fade">
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
import SearchDropdownList from '@/components/SearchDropdownList.vue'

export default {
  name: 'Home',
  props: {
    modSearchResults: Array,
    modSearchTerm: String,
    noResultFound: Boolean,
    refinedSearchFiltersTemplate: Object,
    activeProfileVersion: String,
  },
  components: {
    SearchDropdownList,
  }
}
</script>
