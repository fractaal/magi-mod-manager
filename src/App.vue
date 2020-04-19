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
        <form v-on:submit.prevent="modSearch" style="position: relative;">
          <input v-model="modSearchTerm" class="input" type="text" size="50" placeholder="Search...">
          <input class="searchButton" type="submit" hidden>
          <i class="fa fa-search" style="position:absolute; top: 12px; right: 12px;"></i>
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
        <h2>Job Queue</h2>
        <div style="display: grid; grid-template-columns: 1fr; overflow-y: auto; max-height: 87vh;">
          <transition-group name="fade">
            <div v-for="job in jobQueue" :key="job.key" class="jobCard" :class="[(job.operation == 'Complete' && job.progress == 1) ? 'success' : ''] + [(job.operation == 'Failed' && job.progress == 1) ? 'failed' : '']">
              <h2>{{job.name}}</h2>
              <p>{{job.file_name}}</p>
              <div class="progress">
                <span :style="{width: job.progress * 100 + '%'}"></span>
              </div>
              <p>{{job.operation}} - {{Math.round(job.progress * 100) + '%'}} - {{job.auxiliary}}</p>
              <p>{{job.reason}}</p>
            </div>
          </transition-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
const Curseforge = require('mc-curseforge-api') // for searching and other important functions
const fs = require('fs') // filesystem read / write 
const path = require('path') // file extension things 
const { remote } = require('electron') // dialogs and stuff
const size = require('filesize').partial({standard: "iec"}) // Filesize formatting

const AppPath = remote.app.getPath('userData')

console.log(AppPath)

const configTemplate = {
  activeProfile: {
    name: "Default",
    mods: [],
    modDir: "",
    version: "1.12.2",
  }
}

console.log(__dirname)

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
      jobQueue: [

      ],
    }
  },

  created() { 
    // View mod details event
    this.$on('viewModDetails', (pickedMod) => {
      console.log(pickedMod)
      this.modDetails = pickedMod;
      this.$router.push('/modDetails');
    });

    // Start download event
    this.$on('startDownload', (pickedMod) => {
      this.addToJobQueue(pickedMod)
    });

    let index = 0; // Job manager index

    // Job Manager Loop
    setInterval(() => {
      console.log("Current job queue index is " + index);
      
      /*
      if (this.jobQueue.length == 0) { return } // Don't start if job queue index is 0
      if (index > this.jobQueue.length) { index = 0; return } // Reset index to 0 if the index is larger than the queue
      if (!this.jobQueue[index].lock && this.jobQueue[index].progress != 1) {
      */


        this.jobQueue[index].lock = true // Don't work on it again if you're already downloading it
        setImmediate(() => {
          let job = this.jobQueue[index];

          let lastTime = Date.now()
          let lastRecieved = 0

          let filesize = 0;

          function update(meta) { // This is called each time the downloader module gets a new chunk of data
            job.operation = "Downloading"
            job.progress = meta.recieved / meta.totalSize
            job.auxiliary = (size(meta.recieved) + ' of ' + size(meta.totalSize))

            lastRecieved = meta.recieved
            lastTime = Date.now()

            filesize = meta.totalSize
          }

          // Grab the mod file
          job.mod.getFiles({newest_only: 1, mc_version: this.config.activeProfile.version}).then((files) => {
            let chosen = files[0]
            
            console.log(chosen);

            job.file_name = chosen.file_name; // Show the file name

            // Figure out any dependencies it might have
            for (let dependency in chosen.mod_dependencies) {
              Curseforge.getMods({mod_key: chosen.mod_dependencies[dependency]}).then((mods) => {
                this.addToJobQueue(mods[0], "Needed by " + job.name)
              });
            }

            // Download the mod
            chosen.download(AppPath + "/Mod.jar", {
              override: true,
              auto_check: false,
            }, 
            update).then(() => {
              job.operation = "Complete"
              job.auxiliary = size(filesize)
              job.progress = 1
            }).catch(err => {
              job.progress = 1
              job.auxiliary = err
              job.operation = "Failed"
            });
          })
          
        });

      /*
      } else if (this.jobQueue[index].progress == 1) {
        console.log("Weeee")
        index++; 
      }
      */

    }, 1000)

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

    addToJobQueue(mod, reason) {
      this.jobQueue.push({
        mod,
        progress: 0,
        operation: "Queued",
        name: mod.name,
        file_name: "...",
        auxiliary: mod.file_size,
        reason: reason || "User initiated",
        key: Date.now(),
        lock: false,
      });
    }
  }
}

</script>

<style>

@import url('./css/fonts.css');
@import url('./css/font-awesome.min.css');
@import url('./css/appStyle.css');

</style>
