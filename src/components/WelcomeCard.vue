<template>
  <div style="height: 75vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
    <h1>Welcome to Magi {{appVersion}}</h1>
    <p><a href="#" v-on:click="$eventHub.$emit('searchHome')">Search for some mods</a> to download!</p>
  </div>
</template>

<script>
  export default {
    name: 'WelcomeCard',
    props: {
      appVersion: String
    }
  }
</script>