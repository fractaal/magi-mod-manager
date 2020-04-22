<template>
  <div class="card" :class="mod.enabled ? '' : 'disabled'" style="flex-grow:1; display: grid; grid-template-columns: 6fr 1fr;">
    <div style="display: flex;" v-on:click="$eventHub.$emit('')" class=" animate-hover">
      <img :src="mod.logo" style="height: 100px; width: 100px; object-fit: contain; margin-right:1em;">
      <div style="display: grid; grid-columns-template: 1fr;">
        <p style="font-size: 2em;">{{mod.name}}</p>
        <p>By <b>{{mod.owner}}</b></p>
        <p>{{mod.blurb}}</p>
        <p v-if="mod.reason != 'User initiated'">{{mod.reason}}</p>
      </div>
    </div>
    <div>
      <span class="hover-shine" v-on:click="$eventHub.$emit('deleteMod', mod)">
        <i style="display: flex; justify-content: center;" class="fa fa-trash-o fa-2x"></i>
        <h4 style="display: flex; justify-content: center;">Delete</h4>
      </span>
      <br>
      <span class="hover-shine" v-on:click="$eventHub.$emit('disableMod', mod)">
        <i style="display: flex; justify-content: center;" class="fa fa-power-off fa-2x"></i>
        <h4 style="display: flex; justify-content: center;">{{mod.enabled ? 'Disable' : 'Enable'}}</h4>
      </span>
    </div>
  </div>
</template>

<script>
/*eslint-disable*/
export default {
  name: "HomeCard",
  props: ['mod'],
}
</script>
