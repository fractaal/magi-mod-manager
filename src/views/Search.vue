<template>
  <div>
    <span style="display: flex;">
      <h1 class="gap">Search</h1>
      <SearchDropdownList class="gap" purpose="search" label="Version" :list="refinedSearchFiltersTemplate.gameVersion" type="gameVersion" :activeProfileVersion="activeProfileVersion" :selected="refinedSearchFilters.gameVersion"/>
      <SearchDropdownList class="gap" purpose="search" label="Category" :list="category" type="category" :selected="refinedSearchFilters.category"/>
    </span>
    <br>
    <div style="max-height: 75vh; overflow-y: auto;">
      <span v-if="modSearchResults.length == 0 && !noResultFound">
        <div v-for="index in 10" :key="index" class="card shimmer" style="height: 5em;"></div>
      </span>
      <transition name="name">
        <div v-if="noResultFound" style="height: 75vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <h1>We couldn't find that mod. Try searching for something else! :(</h1>
        </div>
      </transition>
        <div v-if="!noResultFound">
          <transition-group name="fade">
            <div v-for="modSearchResult in modSearchResults" :key="modSearchResult.id" class="card" style="display: grid; grid-template-columns: 3fr 1fr;">
              <div style="display: flex;" v-on:click="$eventHub.$emit('viewModDetails', modSearchResult)" class=" animate-hover">
                <img :src="modSearchResult.logo.thumbnailUrl" style="height: 100px; width: 100px; object-fit: contain; margin-right:1em;">
                <div style="display: grid; grid-columns-template: 1fr;">
                  <p style="font-size: 2em; font-weight: 900;">{{modSearchResult.name}}</p>
                  <p>By <b>{{modSearchResult.authors[0].name}}</b></p>
                  <p>{{modSearchResult.summary}}</p>
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
    refinedSearchFilters: Object,
    activeProfileVersion: String,
  },
  data() {
    return {
      category: [
        'Biomes',
        'Ores and Resources',
        'Structures',
        'Dimensions',
        'Mobs',
        'Processing',
        'Player Transport',
        'Energy, Fluid and Item Transport',
        'Farming',
        'Redstone',
        'Genetics',
        'Magic',
        'Storage',
        'API and Library',
        'Adventure and RPG',
        'Map and Information',
        'Cosmetic',
        'Miscellaneous',
        'Thermal Expansion',
        'Tinker\'s Construct',
        'Industrial Craft',
        'Thaumcraft',
        'Buildcraft',
        'Forestry',
        'Blood Magic',
        'Lucky Blocks',
        'Applied Energistics 2',
        'CraftTweaker',
        'Armor, Tools and Weapons',
        'Server Utility',
        'Food',
        'Twitch Integration',
        'Fabric'
      ]
    }
  },
  components: {
    SearchDropdownList,
  }
}
</script>
