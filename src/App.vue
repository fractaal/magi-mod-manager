<template>
  <div id="app">
    <div class="wrapper" style="overflow:hidden;">
      <div style="display: flex;" class="topBarColor">
        <span>
          <img src="./assets/icon.png" style="width: 60px; height: 60px; filter: blur(.5px); cursor: pointer;" v-on:click="() => {ExportImportMenu.popup()}">
        </span>
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
          <router-view :mods="config.activeProfile.mods" :modSearchResults="modSearchResults" :modDetails="modDetails" :appVersion="appVersion" :changeLogs="changeLogs"/>
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

const configTemplate = {
  activeProfile: {
    name: "Default",
    mods: [],
    modDir: "",
    version: "1.12.2",
  }
}
export default {
  components: {
    JobQueue: () => import('./components/JobQueue.vue')
  },

  data() {
    // Get changelogs
    let changeLogs = [
      "Partial props data validation across components",
      "Automatic update functionality (Your Magi instance will connect to github.com/fractaal/magi-mod-manager!)",
      "Partial separation of app into separate components now", 
      "Partial implementation of profile functionality",
      "Magi now watches your current active profile directory for changes (in case you wanna drop in mods!)",
    ]
    // Initialize this if the app has no existing configuration (first time run)
    if (!fs.existsSync(AppPath + '/default.json')) {
      fs.writeFileSync(AppPath + '/default.json',JSON.stringify(configTemplate))
    }

    let config = JSON.parse(fs.readFileSync(AppPath + '/default.json'))

    // Export/import menu items
    var exportImportMenu = remote.Menu.buildFromTemplate([
      {
        label: 'Export profile...',
        click: this.exportProfile,
      },
      {
        label: 'Import profile...',
        click: this.importProfile,
      }
    ])

    return {
      config: config,
      modSearchTerm: "",
      modSearchResults: [],
      modDetails: {},
      jobQueue: [

      ],
      profileFolderWatcher: {},
      exportImportMenu,
      appVersion: remote.app.getVersion(),
      changeLogs,
    }
  },

  created() { 
    // Delete mod event
    this.$eventHub.$on('deleteMod', (pickedMod) => {
      
      try {
        if (pickedMod.enabled) {
          fs.unlinkSync(this.config.activeProfile.modDir + '/' + pickedMod.file_name)
        } else {
          fs.unlinkSync(this.config.activeProfile.modDir + '/' + pickedMod.file_name + '.disabled')
        }
      } catch {
        console.warn("Mod file was already deleted or the object does not have the .enabled key");
      }

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

    // Remove specific job from Queue
    this.$eventHub.$on('removeFromJobQueue', key => {
      this.removeFromJobQueue(key);
    })

    // Display search home event
    this.$eventHub.$on('searchHome', () => {
      this.searchHome();
    });

    // Watch currently active profile folder
    if (this.config.activeProfile.modDir) {
      this.startProfileFolderWatcher()
    }

    let jobQueueIndex = 0; // Job manager jobQueueIndex
    let jobManager;

    // Job Manager Loop
    if (!jobManager) {
      jobManager = setInterval(() => {
        if (this.jobQueue.length == 0 || jobQueueIndex > this.jobQueue.length || !this.jobQueue[jobQueueIndex]) { jobQueueIndex = 0; return } 
        // Don't start if job queue jobQueueIndex is 0; Reset jobQueueIndex to 0 if the jobQueueIndex is larger than the queue or if current jobQueueIndex maps to no job

        if (!this.jobQueue[jobQueueIndex].lock && this.jobQueue[jobQueueIndex].progress != 1) {
          this.jobQueue[jobQueueIndex].lock = true // Don't work on it again if you're already downloading it
          setTimeout(() => {
            let job = this.jobQueue[jobQueueIndex];

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
            job.mod.getFiles({newest_only: true, mc_version: this.config.activeProfile.version}).then((files) => {
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
        } else if (this.jobQueue[jobQueueIndex].progress == 1) {
          console.log("Weeee")
          jobQueueIndex++; 
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
        page_size: 30,
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
      if (mod) {
        this.config.activeProfile.mods.push({
          name: mod.name,
          logo: mod.logo,
          owner: mod.owner,
          blurb: mod.blurb,
          id: mod.id,
          managed: true,
          reason: payload.reason,
          file_name: payload.file_name,
          enabled: true,
        })
      } else {
        this.config.activeProfile.mods.push({
          name: payload.file_name,
          reason: payload.reason,
          file_name: payload.file_name,
          owner: "Unknown",
          enabled: true,
          managed: false,
          id: Date.now(),
        })
      }
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

      if (this.modExistsInProfile(mod)) {
        console.warn(mod.name + " already exists");
        return;
      }

      if (this.modExistsInJobQueue(mod)) {
        console.warn(mod.name + " already exists");
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
        this.startProfileFolderWatcher()
        return chosenDirectory[0];
      } else {
        return null;
      }
    },

    saveConfigToFile() {
      console.log("Saving to file");
      fs.writeFile(AppPath + '/default.json', JSON.stringify(this.config), () => {console.log("Asynchronous write complete")})
    },

    modExistsInProfile(_mod) {
      for (let mod in this.config.activeProfile.mods) {
        if (this.config.activeProfile.mods[mod].id == _mod.id) {
          return true;
        }
      }
      return false;
    },

    modExistsInJobQueue(_mod) {
      for (let job in this.jobQueue) {
        if (this.jobQueue[job].mod.id == _mod.id) {
          return true;
        }
      }
      return false;
    },

    startProfileFolderWatcher() {
      this.profileFolderWatcher = fs.watch(this.config.activeProfile.modDir, (eventType, filename) => {
        console.log(eventType, filename)
        if (eventType == "rename") {
          if (path.extname(filename) == ".disabled") { // Something has happened to a .disabled file
            if (fs.existsSync(this.config.activeProfile.modDir + '/' + path.basename(filename, '.disabled'))) { // If the file now has the .jar extension
              console.warn("it was just enabled, silly me!")
              return; // It was just enabled
            } else {
              this.$eventHub.$emit('deleteMod', {file_name: filename});
            }
          } else if (path.extname(filename) == ".jar") { // Something has happened to a .jar file
            if (fs.existsSync(this.config.activeProfile.modDir + '/' + filename)) {
              for (let mod in this.config.activeProfile.mods) {
                if (this.config.activeProfile.mods[mod].file_name == filename) {
                  return;
                }
              }
              for (let job in this.jobQueue) {
                if (this.jobQueue[job].file_name == filename) {
                  return;
                }
              }
              console.warn(".jar file was added outside of Magi");
              this.addToMods(null, {file_name: filename, reason: "Added manually outside of Magi"})
            } else if (fs.existsSync(this.config.activeProfile.modDir + '/' + filename + '.disabled')) {
              console.warn("it was just disabled, silly me!")
              return // it was just disabled
            } else {
              this.$eventHub.$emit('deleteMod', {file_name: filename});
            }
          }
        }
      })
    }, 

    stopProfileFolderWatcher() {
      this.profileFolderWatcher().close()
    },

    exportProfile() {

    },

    importProfile() {

    }
  }
}

</script>

<style>

  @import url('./css/fonts.css');
  @import url('./css/font-awesome.min.css');
  @import url('./css/appStyle.css');

</style>
