<template>
  <div style="height: 75vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
    <h1>Welcome to Magi {{appVersion}}!</h1>
    <ul>
      <li v-for="changeLog in changeLogs" :key="changeLog">{{changeLog}}</li>
    </ul>
    <br>
    <p><a href="#" v-on:click="$eventHub.$emit('searchHome')">Search for some mods</a> to download!</p>
  </div>
</template>

<script>
  export default {
    name: 'WelcomeCard',
    props: {
      appVersion: String,
      changeLogs: Array,
    }
  }
</script>