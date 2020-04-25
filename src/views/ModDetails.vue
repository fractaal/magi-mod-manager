<template>
  <div class="home">
    <div v-if="modDetails === 'load'">
      <h1 class="shimmer-text">Loading...</h1>
    </div>
    <div v-if="modDetails !== 'load'" style="display: grid; grid-columns-template: 1fr; max-height: 80vh; overflow: auto; margin-left:1em; margin-right:1em;">
      <br>
      <button style="margin-left:20px; margin-right:20px; margin-bottom: 20px;" class="input-not-round" @click="$router.go(-1)">Go Back</button>
      <div style="display: flex;">
        <div style="margin-right: 1em;">
          <img :src="modDetails.logo.thumbnailUrl" style="width: auto; height: auto;">
        </div>
        <div>
          <h1>{{modDetails.name}}</h1>
          <h4>{{modDetails.blurb}}</h4>
        </div>
      </div>
      <br>
      <p>Created by <b>{{modDetails.owner}}</b> on {{modDetails.created}}</p>
      <p>{{modDetails.downloads}} downloads</p>
      <br>
      <span v-html="modDetails.description">

      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModDetails',
  props: {
    modDetails: [Object, String]
  },
  created() {

  }
}
</script>

<style scoped>
  p {
    user-select: text; 
  }
</style>
