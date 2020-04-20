<template>
  <div id="app">
    <div class="wrapper" style="overflow:hidden;">
      <div style="display: flex;" class="topBarColor">
        <span style="margin-left:10px;">
          <h3>{{config.activeProfile.name}}</h3>
          <p style="font-size: 14px;">{{config.activeProfile.mods.length}} mods active</p>
          <p style="font-size: 14px;">Minecraft {{config.activeProfile.version}}</p>
        </span>
        <router-link to="/"><button style="height: 3.5em;" class="input"><i class="fa fa-home fa-lg"></i></button></router-link>
        <button class="input" v-on:click="searchHome" style="height: 3.5em;"><i class="fa fa-search fa-lg" ></i></button>
        <form v-on:submit.prevent="modSearch" style="position: relative;">
          <input v-model="modSearchTerm" style="height: 30px;" class="textinput" type="text" size="50" placeholder="Search...">
          <input class="searchButton" type="submit" hidden>
          <i class="fa fa-search" style="color: #fff; position:absolute; top: 18px; right: 15px;"></i>
        </form>
      </div>
      <div class="topBarColor">
      </div>
      <div class="routerViewColor">
        <transition name="fade">
          <router-view :mods="config.activeProfile.mods" :modSearchResults="modSearchResults" :modDetails="modDetails"/>
        </transition>
      </div>
      <JobQueue :jobQueue="jobQueue"></JobQueue>
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
  components: {
    JobQueue: () => import('./components/JobQueue.vue')
  },

  data() {
    // Initialize this if the app has no existing configuration (first time run)
    if (!fs.existsSync(AppPath + '/default.json')) {
      fs.writeFileSync(AppPath + '/default.json',JSON.stringify(configTemplate))
    }

    let config = JSON.parse(fs.readFileSync(AppPath + '/default.json'))

    return {
      config: config,
      modSearchTerm: "",
      modSearchResults: [],
      modDetails: {},
      jobQueue: [

      ],
    }
  },

  created() { 
    // Delete mod event
    this.$eventHub.$on('deleteMod', (pickedMod) => {

      fs.unlinkSync(this.config.activeProfile.modDir + '/' + pickedMod.file_name)

      for (let mod in this.config.activeProfile.mods) {
        if (this.config.activeProfile.mods[mod].file_name == pickedMod.file_name) {
          this.config.activeProfile.mods.splice(mod, 1);
        }
      }
        this.saveConfigToFile()
    });

    // Disable mod event
    this.$eventHub.$on('disableMod', (pickedMod) => {

      if (pickedMod.enabled) {
        fs.renameSync(this.config.activeProfile.modDir + '/' + pickedMod.file_name, this.config.activeProfile.modDir + '/' + pickedMod.file_name + '.disabled')
          pickedMod.enabled = false
      } else {
        fs.renameSync(this.config.activeProfile.modDir + '/' + pickedMod.file_name + '.disabled', this.config.activeProfile.modDir + '/' + pickedMod.file_name)
          pickedMod.enabled = true
      }
      this.saveConfigToFile()
    });

    // View mod details event
    this.$eventHub.$on('viewModDetails', (pickedMod) => {
      console.log(pickedMod)
      this.modDetails = pickedMod;
      this.$router.push('/modDetails');
    });

    // Start download event
    this.$eventHub.$on('startDownload', (pickedMod) => {
      this.addToJobQueue(pickedMod)
    });

    this.$eventHub.$on('removeFromJobQueue', key => {
      this.removeFromJobQueue(key);
    })

    let index = 0; // Job manager index
    let jobManager;

    // Job Manager Loop
    if (!jobManager) {
      jobManager = setInterval(() => {
        if (this.jobQueue.length == 0 || index > this.jobQueue.length || !this.jobQueue[index]) { index = 0; return } 
        // Don't start if job queue index is 0; Reset index to 0 if the index is larger than the queue or if current index maps to no job

        if (!this.jobQueue[index].lock && this.jobQueue[index].progress != 1) {
          this.jobQueue[index].lock = true // Don't work on it again if you're already downloading it
          setTimeout(() => {
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
              chosen.download(this.config.activeProfile.modDir + "/" + chosen.file_name, {
                override: true,
                auto_check: true,
              }, 
              update).then(() => {
                job.operation = "Complete"
                job.auxiliary = size(filesize)
                job.progress = 1

                this.addToMods(job.mod, {reason: job.reason, file_name: chosen.file_name})
                this.saveConfigToFile()

              }).catch(err => {
                job.progress = 1
                job.auxiliary = err
                job.operation = "Failed"
              });
            })
            
          }, 1);
        } else if (this.jobQueue[index].progress == 1) {
          console.log("Weeee")
          index++; 
        }

      }, 1000)
    } else {
      console.warn("Job manager already exists!")
    }

  },

  methods: {
    modSearch() {
      this.$router.push('/search')
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

    searchHome() {
      console.log(this.modSearchResults.length)
      this.$router.push('/search')
      if (this.modSearchResults.length == 0) {
        this.modSearchResults = [],
        Curseforge.getMods({
          mod_name: "",
          mc_version: this.config.activeProfile.version,
          }).then((mods) => {
          if (mods.length > 0) {
            this.modSearchResults = mods;
          } else {
            this.modSearchResults = [{name: "No result!!! :(("}]
          }
        });
      }
    },

    addToMods(mod, payload) {
      /*
      let _mod = mod
      _mod.reason = payload.reason
      _mod.file_name = payload.file_name
      _mod.enabled = true
      this.config.activeProfile.mods.push(_mod)
      */

      this.config.activeProfile.mods.push({
        name: mod.name,
        logo: mod.logo,
        owner: mod.owner,
        blurb: mod.blurb,
        reason: payload.reason,
        file_name: payload.file_name,
        enabled: true,
      })
    },

    addToJobQueue(mod, reason) {
      if (!this.config.activeProfile.modDir) {
        remote.dialog.showMessageBox({
          type: 'info',
          title: 'Select a mod directory',
          message: 'Before you can download any mods, select a mod directory (preferably the mods folder in your Minecraft profile)',
        })
        if (!this.changeModDirectory()) {
        remote.dialog.showMessageBox({
          type: 'error',
          title: 'No mod directory selected',
          message: "You didn't select a mod directory! Download aborted.",
        })
        return;
        }
      }

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
    },

    removeFromJobQueue(key) {
      for (let job in this.jobQueue) {
        if (this.jobQueue[job].key == key) {
          this.jobQueue.splice(job, 1); 
        }
      }
    },

    changeModDirectory() {
      let chosenDirectory = remote.dialog.showOpenDialog({properties: ['openDirectory']});
      if (chosenDirectory) {
        this.config.activeProfile.modDir = chosenDirectory[0]
        return chosenDirectory[0];
      } else {
        return null;
      }
    },

    saveConfigToFile() {
      console.log("Saving to file");
      fs.writeFile(AppPath + '/default.json', JSON.stringify(this.config), () => {console.log("Asynchronous write complete")})
    }
  }
}

</script>

<style>

@import url('./css/fonts.css');
@import url('./css/font-awesome.min.css');
@import url('./css/appStyle.css');

</style>
