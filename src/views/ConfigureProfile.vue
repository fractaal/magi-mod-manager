<template>
  <div>
    <h1>Configure profile</h1>
    <div class="centered-no-justify">
      <span style="display: flex; justify-content: flex-start; align-items: center;">
        <h3 style="margin-right: 10px;">You're now modifying</h3><h1>{{config.activeProfile.name}}</h1>
      </span>
      <br>
      <TextBox label="Profile Name" :initialValue="config.activeProfile.name" placeholder="Name here..."/>
      <br>
      <DirectoryChooser label="Profile Directory" :initialValue="config.activeProfile.instanceDirectory" placeholder="Directory here..."/>
      <br>
      <DropdownList type="gameVersion" label="Minecraft Version" purpose="config" :list="refinedSearchFiltersTemplate.gameVersion" :selected="config.activeProfile.version"/>
      <!--<TextBox label="Profile Version" :initialValue="config.activeProfile.version" placeholder="Version here..."/>-->
      <br>
      <div style="display: flex;">
        <button style="margin-left:20px; margin-right:20px; margin-bottom: 20px;" class="input-not-round input-highlight" @click="configureProfile">Save my changes</button>
        <button style="margin-left:20px; margin-right:20px; margin-bottom: 20px;" class="input-not-round" @click="$router.push('/')">Never mind</button>
        <button style="margin-left:20px; margin-right:20px; margin-bottom: 20px;" class="input-not-round input-highlight-danger" @click="$eventHub.$emit('deleteProfile')">Delete this profile</button>
      </div>
    </div>
  </div>

</template>

<script>
  const validFilename = require('valid-filename');
  import { remote } from 'electron'

  import TextBox from '../components/TextBox'
  import DropdownList from '../components/SearchDropdownList'
  import DirectoryChooser from '../components/DirectoryChooser'

  export default {
    name: 'NewProfile',
    components: {
      TextBox,
      DropdownList,
      DirectoryChooser,
    },

    props: {
      config: Object,
      refinedSearchFiltersTemplate: Object,
    },

    data() {
      return {
        newConfig: {},
      }
    },

    created() {
      this.$on('change', (userInput, who) => {
        if (who == "Minecraft Version") {
          this.newConfig.version = userInput.gameVersion
        } else if (who == "Profile Directory") {
          this.newConfig.instanceDirectory = userInput
        } else if (who == "Profile Name") {
          this.newConfig.name = userInput
        }
      })
    },

    methods: {
      configureProfile() {
        if (this.newConfig.name) {
          if (!validFilename(this.newConfig.name)) {
            remote.dialog.showErrorBox('Invalid name', 'You can\'t use this name! Please use another one.')
            return;
          }
        }
        this.$eventHub.$emit('configureProfile', this.newConfig);
        this.$router.push('/')
      },
    }
  }
</script>