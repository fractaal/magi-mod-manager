<template>
  <div id="app">
    <div class="wrapper" style="overflow:hidden;">
      <div style="display: flex;" class="topBarColor">
        <span style="margin-left:10px;">
          <h3>{{config.activeProfile.name}}</h3>
          <p style="font-size: 14px;">{{config.activeProfile.mods.length}} mods active</p>
          <p style="font-size: 14px;">Minecraft {{config.activeProfile.version}}</p>
        </span>
        <router-link to="/"><button class="input">Your Mods</button></router-link>
        <form v-on:submit.prevent="modSearch">
          <input v-model="modSearchTerm" class="input" type="text" size="50" placeholder="Search...">
          <input class="searchButton" type="submit" hidden>
        </form>
      </div>
      <div class="topBarColor">
      </div>
      <div class="routerViewColor">
        <transition name="fade">
          <router-view :modSearchResults="modSearchResults" :modDetails="modDetails"/>
        </transition>
      </div>
      <div class="jobViewColor">
        Hi
      </div>
    </div>
  </div>
</template>

<script>
/*eslint no-unused-vars:1*/

const Curseforge = require('mc-curseforge-api') // for searching and other important functions
const fs = require('fs') // filesystem read / write 
const path = require('path') // file extension things 
const { remote } = require('electron') // dialogs and stuff

const AppPath = remote.app.getAppPath()

console.log(AppPath)

const configTemplate = {
  activeProfile: {
    name: "Default",
    mods: [],
    modDir: "",
    version: "1.12.2",
  }
}

export default {
  data() {
    // Initialize this if the app has no existing configuration (first time run)
    if (!fs.existsSync(AppPath + '/config.json')) {
      fs.writeFileSync(AppPath + '/config.json',JSON.stringify(configTemplate))
    }

    let config = JSON.parse(fs.readFileSync(AppPath + '/config.json'))

    return {
      config: config,
      modSearchTerm: "",
      modSearchResults: {},
      modDetails: {},
      jobQueue: [],
    }
  },

  mounted() {
    // View mod details event
    this.$on('viewModDetails', (pickedMod) => {
      console.log(pickedMod)
      this.modDetails = pickedMod;
      this.$router.push('/modDetails');
    });

    // Job manager event loop
    
  },

  methods: {
    modSearch() {
      this.modSearchResults = [],
      Curseforge.getMods({
        mod_name: this.modSearchTerm,
        mc_version: this.config.activeProfile.version,
        }).then((mods) => {
        if (mods.length > 0) {
          this.modSearchResults = mods;
        } else {
          this.modSearchResults = [{name: "No result!!! :(("}]
        }
      });
    },

    addToJobQueue() {

    }
  }
}

</script>

<style>

@import url('./css/fonts.css');

* {
  padding: 0;
  margin: 0;
  font-family: 'Quicksand'
}

.card {
  background-color: #8CB698;
  color: #EBF6F1;

  margin: 1em 5em 1em 5em;
  padding-top: 3em;
  padding-bottom: 3em;
  padding-left: 3em;

  border-radius: 30px;
}

.animate-hover {
  transition: 0.15s cubic-bezier(0.55, 0.085, 0.68, 0.53);
}

.animate-hover:hover {
  padding-left: 30px;
  filter: saturate(200%);
  cursor: pointer;
}

.card-padding {
  margin: 1em 5em 1em 5em;
  padding-top: 3em;
  padding-bottom: 3em;
  padding-left: 3em;
}

.searchButton {
  padding: .75em;
  margin-left: 20px;
  border-radius: 10px;
  background-color: #F69EA1;
  border: 0px;
  font-size: 1em;
}

.input {
  padding: .75em;
  margin-left: 20px;
  border-radius: 10px;
  background-color: #F69EA1;
  border: 0px;
  font-size: 1em;
  outline: none;
  transition: 0.15s cubic-bezier(0.55, 0.085, 0.68, 0.53);
}

.input:hover {
  padding-left: 20px;
  padding-right: 20px;
  box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.2);
}

.wrapper {
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: 1fr 23fr;
  width: 100vw;
  height: 100vh;
}

.wrapper > div {
  padding: 1em;
}

.topBarColor {
  background-color: #FCDCE1;
}

.routerViewColor {
  background-color: #EBF6F1;
}

.jobViewColor {
  background-color: #CFEAE0;
}

.shimmer {
  animation: shimmer 0.5s cubic-bezier(0.445, 0.05, 0.55, 0.95) 0s infinite;
}

@keyframes shimmer {
  0% {
    color: rgba(0, 0, 0, 1);
  }

  50% {
    color: rgba(0, 0, 0, .2);
  }

  100% {
    color: rgba(0, 0, 0, 1);
  }
}

.fade-enter-active {
  transition: opacity .25s;
}

.fade-leave-active {
  transition: opacity 0s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

::-webkit-scrollbar{
	width: 10px;
}

::-webkit-scrollbar-track-piece{
	background-color: rgba(0,0,0,0);
}

::-webkit-scrollbar-thumb{
	background-color: #CBCBCB;
	border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover{
	background-color: #909090;
}

</style>
