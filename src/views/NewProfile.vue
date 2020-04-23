<template>
  <div>
    <h1>Make a new profile</h1>
    <div class="centered">
      <span style="text-align: center">
        <h2>Enter your profile name here</h2>
      </span>
      <br>
      <TextBox :onSubmit="createProfile" placeholder="Name here..."/>
      <br>
      <div style="display: flex;">
        <button style="margin-left:20px; margin-right:20px; margin-bottom: 20px;" class="input-not-round input-highlight" @click="createProfile">Create new profile</button>
        <button style="margin-left:20px; margin-right:20px; margin-bottom: 20px;" class="input-not-round" @click="$router.push('/')">Never mind</button>
      </div>
    </div>
  </div>

</template>

<script>
  import TextBox from '../components/TextBox'

  export default {
    name: 'NewProfile',
    components: {
      TextBox
    },

    data() {
      return {
        name: '',
      }
    },

    created() {
      this.$on('change', userInput => {
        console.log(userInput)
        this.name = userInput;
      })
    },

    methods: {
      createProfile() {
        this.$eventHub.$emit('createProfile', this.name);
      },
    }
  }
</script>