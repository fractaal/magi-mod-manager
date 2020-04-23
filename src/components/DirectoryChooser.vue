<template>
  <div>
    <form v-on:submit.prevent="onSubmit(userInput, label)" style="position: relative;">
      <label :for="label">{{label}}</label>
      <input @click="openDirectoryDialog" :id="label" v-model="userInput" style="height: 30px;" class="textinput" type="text" size="50" :placeholder="placeholder">
      <input class="searchButton" type="submit" hidden>
      <i class="fa" :class="icon" style="color: #fff; position:absolute; top: 18px; right: 15px;"></i>
    </form>
  </div>
</template>

<script>
  import {remote} from 'electron';

  export default {
    name: 'DirectoryChooser',
    props: {
      "onSubmit": Function,
      "placeholder": String,
      "icon": String,
      initialValue: String,
      label: String,
    },
    data() {
      return {
        userInput: ''
      }
    },
    created() { 
      this.userInput = this.initialValue
    },
    methods: {
      openDirectoryDialog() {
        let chosenDirectory = remote.dialog.showOpenDialog({properties: ['openDirectory']})
        if (chosenDirectory) {
          this.userInput = chosenDirectory[0]
          this.$parent.$emit('change', this.userInput, this.label)
        }
      }
    }
  }
</script>

<style scoped>
.textinput {
  cursor: pointer;
  padding: .75em;
  margin-left: 20px;
  border-radius: 10px;
  background-color: rgba(0,0,0,.1);
  border: 0px;
  font-size: 1em;
  outline: none;
  /*transition: 0.15s cubic-bezier(0.55, 0.085, 0.68, 0.53);*/
  color: #fff;
}

.textinput::placeholder {
  color: rgba(255,255,255,.5);
}

.textinput:hover {
  padding-left: 20px;
  padding-right: 20px;
  box-shadow: inset 0px 0px 10px 0px rgba(0,0,0,0.1);
}

.textinput:hover::placeholder {
  color: rgba(255,255,255,1);
}
</style>