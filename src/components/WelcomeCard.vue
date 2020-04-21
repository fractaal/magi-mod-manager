<template>
  <div style="height: 75vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
    <h1>Welcome to Magi</h1>
    <p><a href="#" v-on:click="$eventHub.$emit('searchHome')">Search for some mods</a> to download!</p>
  </div>
</template>

<script>
  export default {
    name: 'WelcomeCard'
  }
</script>