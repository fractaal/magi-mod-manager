<template>
  <div>
    <h1>Twitch Profile Import</h1>
    <div class="centered">
      <Spinner/>
      <h1 class="shimmer-text">Importing Twitch profile...</h1>
      <h3>{{importStatus}}</h3>
    </div>
  </div>
</template>

<script>
export default {
  name: "ImportProfileLoadScreen",
  props: {
    importStatus: String,
  },
  components: {
    Spinner: () => import("../components/Spinner")
  }
}
</script>