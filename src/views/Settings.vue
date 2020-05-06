<template>
  <div>
    <h1>Magi Settings</h1>
    <div style="display: flex; height: calc(100vh - 300px);">
      <div style="width: 20vw;">
      </div>
      <div style="display: flex; flex-direction: column;">
        <br>
        <div class="card-flush">
          <TextBox :initialValue="appSettings.maxActiveJobs" type="number" label="Maximum Active Jobs" mkey="maxActiveJobs"/>
          <br>
          <p style="opacity: .5;"><i>Controls how much downloads can progress at the same time.</i></p>
        </div>
        <div class="card-flush">
          <Toggle :initialValue="appSettings.smartDownload" label="Smart Download" mkey="smartDownload"/>
          <br>
          <p style="opacity: .5;"><i>Smart Download allows Magi to simply copy the mod file from disk if it was already previously downloaded, saving you data and time!</i></p>
        </div>
        <br>
        <div style="display: flex; margin-top: auto;">
          <button style="margin-left:20px; margin-right:20px; margin-bottom: 20px;" class="input-not-round input-highlight" @click="changeSettings">Save my changes</button>
          <button style="margin-left:20px; margin-right:20px; margin-bottom: 20px;" class="input-not-round" @click="$router.push('/')">Never mind</button>
        </div>
      </div>
      <div style="width: 20vw;">

      </div>
    </div>
  </div>

</template>

<script>
  //import { remote } from 'electron'

  import TextBox from '../components/TextBox'
  import Toggle from "../components/Toggle"

  export default {
    name: "MagiSettings",
    components: {
      TextBox,
      Toggle,
    },

    props: {
      appSettings: Object,
    },

    data() {
      return {
        newSettings: {},
      }
    },

    created() {
      this.newSettings = Object.assign({}, this.appSettings);
      this.$on("change", (input, label, mkey) => {
        this.newSettings[mkey] = input;
      });
    },

    methods: {
      changeSettings() {
        this.$eventHub.$emit("changeAppSettings", this.newSettings);
        this.$router.push("/");
      }
    }
  }
</script>