<template>
  <div class="home">
    <div style="display: grid; grid-columns-template: 1fr; max-height: 100vh; overflow: auto;">
      <div style="display: flex;">
        <button class="input" v-on:click="$router.go(-1)">Go Back</button>
      </div>
      <br>
      <div style="display: flex;">
        <div style="margin-right: 1em;">
          <img :src="modDetails.logo">
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
  props: ["modDetails"]
}
</script>
