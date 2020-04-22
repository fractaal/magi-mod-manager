<template>
  <div style="height: 75vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
    <h1 style="font-size: 50px;">Welcome to Magi {{appVersion}}!</h1>
    <br>
    <ul>
      <li style="font-weight: lighter; font-size: 20px;" v-for="changeLog in changeLogs" :key="changeLog">{{changeLog}}</li>
    </ul>
    <br>
    <br>
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