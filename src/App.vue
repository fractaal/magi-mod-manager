<template>
  <div>
    <router-view/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Magi from './magi';

const _magi = new Magi();

export default Vue.extend({
  name: "App",
  data() {
    return {
      magi: _magi,
    }
  },
})
</script>

<style>
* {
  font-family: 'Product Sans' !important;
  font-size: 110%;
  font-weight: 900;
}
</style>
