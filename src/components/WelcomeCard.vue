<template>
  <div class="centered">
    <h1 style="font-size: 50px;">Welcome to Magi {{appVersion}}!</h1>
    <h2>Prerelease Build (Blue top bar)</h2>
    <br>
    <br>
    <h2>You now have</h2>
    <transition name="fade">
      <h1 :key="scroller">{{changeLogs[scroller]}}</h1>
    </transition>
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
    },
    data() {
      return {
        scrollerFunction: '',
        scroller: 0
      }
    },
    created() {
      this.scrollerFunction = setInterval(() => {
        this.scroller++;
        if (this.scroller == this.changeLogs.length) {
          this.scroller = 0
        }
      }, 3000)
    },
    destroyed() {
      delete this.scrollerFunction;
    }
  }
</script>

<style scoped>
.fade-enter-active {
  transition: opacity .25s;
}

.fade-leave-active {
  transition: opacity 0;
  position: absolute;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>