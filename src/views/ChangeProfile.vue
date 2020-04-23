<template>
  <div>
    <h1>Change profile</h1>
    <div class="centered">
      <span style="text-align: center">
        <h2>Select your profile</h2>
      </span>
      <List :list="profiles"/>
      <button style="margin-left:20px; margin-right:20px; margin-bottom: 20px;" class="input-not-round" @click="$router.push('/')">Never mind</button>
    </div>
  </div>
</template>

<script>
import List from '../components/List.vue'

  export default {
    name: 'ChangeProfile',
    components: {
      List
    },

    props: {
      profiles: Array,
    },

    data() {
      return {
        newProfile: '',
      }
    },

    created() {
      this.$on('itemClicked', userInput => {
        console.log(userInput)
        this.newProfile = userInput;
        this.$eventHub.$emit('changeProfile', this.newProfile);
      })
    },
  }
</script>