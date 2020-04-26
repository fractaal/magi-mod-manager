<template>
  <div id="app" style="overflow: hidden;">
    <div class="topBarColor">
      <div style="display: flex; flex-direction: row; margin-bottom: -20px; -webkit-app-region: drag;">
        <p style="padding-top: 5px; padding-left: 10px; font-size: 14px;">Magi {{appVersion}}</p>
        <span style="margin-left: auto;">
          <button v-on:click="minimize" class="titleBarButton" style="position: relative; top: 0px; right: 1px;"><i class="fa fa-window-minimize"></i></button>
          <button v-on:click="maximize" class="titleBarButton" style="position: relative; top: 0px; right: 1px;"><i class="fa fa-window-maximize"></i></button>
          <button v-on:click="close" class="titleBarButton" style="position: relative; top: 0px; right: 1px;"><i class="fa fa-times fa-lg"></i></button>
        </span>
      </div>
      <div style="display: flex; padding: 20px;">
        <span>
          <img src="./assets/100px.png" style="width: 60px; height: 60px; cursor: pointer;" v-on:click="showMessageBox('Brought to you by Ben with love')">
        </span>
        <span style="margin-left:10px;">
          <h3 class="white-text">{{config.activeProfile.name}}</h3>
          <p class="white-text" style="font-size: 14px;">{{config.activeProfile.mods.length}} mods active</p>
          <p class="white-text" style="font-size: 14px;">Minecraft {{config.activeProfile.version}}</p>
        </span>
        <button class="input" @click="() => exportImportMenu.popup()" style="height: 3.5em;"><i class="fa fa-cog fa-lg"></i></button>
        <router-link to="/"><button style="height: 3.5em;" class="input"><i class="fa fa-home fa-lg"></i></button></router-link>
        <button class="input" @click="searchHome" style="height: 3.5em;"><i class="fa fa-search fa-lg" ></i></button>
        <TextBox :onSubmit="modSearch" placeholder="Search..." icon="fa-search"/>
        <!--
        <form v-on:submit.prevent="modSearch" style="position: relative;">
          <input v-model="modSearchTerm" style="height: 30px;" class="textinput" type="text" size="50" placeholder="Search...">
          <input class="searchButton" type="submit" hidden>
          <i class="fa fa-search" style="color: #fff; position:absolute; top: 18px; right: 15px;"></i>
        </form>
        -->
      </div>
    </div>
    <div class="wrapper" style="overflow:hidden;">
      <div class="routerViewColor">
        <transition name="fade">
          <router-view  :mods="config.activeProfile.mods" :modSearchResults="modSearchResults" :modDetails="modDetails" 
                        :appVersion="appVersion" :changeLogs="changeLogs" :modSearchTerm="modSearchTerm" :activeProfileVersion="this.config.activeProfile.version"
                        :refinedSearchFiltersTemplate="refinedSearchFiltersTemplate" :noResultFound="noResultFound" :refinedSearchFilters="refinedSearchFilters"
                        :profiles="profiles" :config="this.config" :importStatus="importStatus"/>
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
const utility = require('./utility');
const twitchImport = require('./twitchImport');

import JobQueue from './components/JobQueue'
import TextBox from './components/TextBox'

import Job from './logic/job';
import { importTwitchZip } from './twitchImport'

const AppPath = remote.app.getPath('userData')

const appSettingsTemplate = {
  activeProfile: 'Default',
  screenSizeX: '1366',
  screenSizeY: '768',
  wasWelcomeScreenDisplayed: false,
}

const configTemplate = {
  activeProfile: {
    name: "Default",
    mods: [],
    instanceDirectory: "",
    version: "1.12.2",
  }
}

export default {
  components: {
    JobQueue,
    TextBox
  },

  data() {
    // Get changeLogs
    let changeLogs = [
      "New, improved, and simpler job manager",
      "Better search (up to date with Twitch itself!)",
      "Easy import of Twitch profiles!"
    ]

    // Get versions
    let versionRequest = new XMLHttpRequest()
    versionRequest.open('GET', 'https://launchermeta.mojang.com/mc/game/version_manifest.json', false);
    versionRequest.send(null);

    let minecraftVersions;

    if (versionRequest.status === 200) {
      minecraftVersions = JSON.parse(versionRequest.responseText);
    }

    // Initialize this if the app has no existing configuration (first time run)
    if (!fs.existsSync(AppPath + '/profiles')) {
      fs.mkdirSync(AppPath + '/profiles')
    }

    if (!fs.existsSync(AppPath + '/appSettings.json')) { // Profile-agnostic app settings
      fs.writeFileSync(AppPath + '/appSettings.json', JSON.stringify(appSettingsTemplate))
    }

    let appSettings = JSON.parse(fs.readFileSync(AppPath + '/appSettings.json'))

    if (!fs.existsSync(AppPath + '/profiles/' + appSettings.activeProfile + '.json')) {
      fs.writeFileSync(AppPath +  '/profiles/' + appSettings.activeProfile + '.json', JSON.stringify(configTemplate))
    }

    let config = JSON.parse(fs.readFileSync(AppPath + '/profiles/' + appSettings.activeProfile + '.json'))
    
    // Export/import menu items
    var exportImportMenu = remote.Menu.buildFromTemplate([
      {
        label: 'New profile...',
        click: () => {this.$router.push('/newProfile')}
      },
      {
        label: 'Configure profile...',
        click: () => {this.$router.push('/configureProfile')}
      },
      {
        label: 'Change profile...',
        click: () => {this.$router.push('/changeProfile')}
      },
      {
        type: 'separator'
      },
      {
        label: 'Export profile...',
        click: this.exportProfile,
      },
      {
        label: 'Import profile...',
        click: this.importProfile,
      },
      {
        type: 'separator',
      },
      {
        label: 'About',
        click: () => {this.$router.push('/Welcome')}
      }
    ])

    return {
      config: config,
      appSettings: appSettings,
      profiles: [],
      modSearchTerm: "",
      modSearchResults: [],
      modDetails: {},
      profileFolderWatcher: null,
      profileListWatcher: null,
      exportImportMenu: exportImportMenu,
      appVersion: remote.app.getVersion(),
      changeLogs: changeLogs,
      refinedSearchFiltersTemplate: {
        gameVersion: minecraftVersions,
      },
      refinedSearchFilters: {
        gameVersion: config.activeProfile.version,
        pageSize: 25,
      },
      noResultFound: false,
      jobQueue: [],
      importStatus: '',
    }
  },

  created() { 
    // Read profiles
    this.profiles = this.readProfiles()

    // Welcome screen
    if (!this.appSettings['wasWelcomeScreenDisplayedFor'+remote.app.getVersion()]) {
      this.$router.push('/Welcome')
      this.appSettings['wasWelcomeScreenDisplayedFor'+remote.app.getVersion()] = true;
    }

    // Delete mod event
    this.$eventHub.$on('deleteMod', (pickedMod) => {
      
      try {
        if (pickedMod.enabled) {
          fs.unlinkSync(this.config.activeProfile.instanceDirectory + '/mods' + '/' + pickedMod.file_name)
        } else {
          fs.unlinkSync(this.config.activeProfile.instanceDirectory + '/mods' + '/' + pickedMod.file_name + '.disabled')
        }
      } catch {
        console.warn("Mod file was already deleted or the object does not have the .enabled key");
      }

      for (let mod in this.config.activeProfile.mods) {
        if (this.config.activeProfile.mods[mod].file_name == pickedMod.file_name) {
          this.config.activeProfile.mods.splice(mod, 1);
        }
      }
        this.saveImportantToFile()
    });

    // Disable mod event
    this.$eventHub.$on('disableMod', (pickedMod) => {
      if (pickedMod.enabled) {
        fs.renameSync(this.config.activeProfile.instanceDirectory + '/mods' + '/' + pickedMod.file_name, this.config.activeProfile.instanceDirectory + '/mods' + '/' + pickedMod.file_name + '.disabled')
          pickedMod.enabled = false
      } else {
        fs.renameSync(this.config.activeProfile.instanceDirectory + '/mods' + '/' + pickedMod.file_name + '.disabled', this.config.activeProfile.instanceDirectory + '/mods' + '/' + pickedMod.file_name)
          pickedMod.enabled = true
      }
      this.saveImportantToFile()
    });

    // View mod details event
    this.$eventHub.$on('viewModDetails', (pickedMod) => {
      console.log(pickedMod)
      this.modDetails = 'load'
      this.$router.push('/modDetails');
      pickedMod.getDescription().then(description => {
        this.modDetails = pickedMod
        this.modDetails.description = description;
      })
    });

    // Start download event
    this.$eventHub.$on('startDownload', (pickedMod) => {
      //this.addToJobQueue(pickedMod)
      // This startdownload event will pick the latest mod file for the selected version
      utility.getLatestModFile(pickedMod, this.config.activeProfile.version).then(latestFile => {
        this.addToJobQueue(pickedMod, "User initiated", latestFile);
      }).catch(error => {console.error(error); return})


    });

    // Remove specific job from Queue
    this.$eventHub.$on('removeFromJobQueue', key => {
      this.removeFromJobQueue(key);
    })

    // Display search home event
    this.$eventHub.$on('searchHome', () => {
      this.searchHome();
    });

    // Update refined search filters
    this.$eventHub.$on('updateSearchFilters', change => {
      for (let key in change) {
        this.refinedSearchFilters[key] = change[key]
      }
      this.modSearch();
    })

    // New profile event
    this.$eventHub.$on('createProfile', name => {
      this.createProfile(name)
    })
    
    // Change profile event
    this.$eventHub.$on('changeProfile', name => {
      this.changeProfile(name);
      this.$router.push('/')
    })

    // Configure profile event 
    this.$eventHub.$on('configureProfile', changes => {
      for (let change in changes) {
        console.log(
          "Updating config key " + change + 
          " from old value (" + this.config.activeProfile[change] + 
          ") to the new one (" + changes[change] + ")")

        if (change == 'name') {
          fs.renameSync(
            AppPath + '/profiles/' + this.config.activeProfile.name + '.json',
            AppPath + '/profiles/' + changes[change] + '.json' // change the name in advance so that changeProfile doesn't break
            )
        }

        this.config.activeProfile[change] = changes[change];
      }

      this.changeProfile(this.config.activeProfile.name)
    })

    // Watch currently active profile folder
    if (this.config.activeProfile.instanceDirectory) {
      this.startProfileFolderWatcher()
    } else {
      console.warn("Current profile has no directory set to it! Profile folder won't start!")
    }

    // Watch profile folder
    if (!this.profileListWatcher) {
      console.log("Starting profile list watcher")
      this.profileListWatcher = fs.watch(AppPath + '/profiles', () => {
        this.profiles = this.readProfiles()
      })
    } else {
      console.warn("Profile list watcher already exists")
    };
    

    let jobQueueIndex = 0; // Job manager jobQueueIndex
    let jobManager;

    // Job Manager Loop
    if (!jobManager) {
      jobManager = setInterval(() => {
        if (this.jobQueue.length == 0 || jobQueueIndex > this.jobQueue.length || !this.jobQueue[jobQueueIndex]) { jobQueueIndex = 0; return } 
        // Don't start if job queue jobQueueIndex is 0; Reset jobQueueIndex to 0 if the jobQueueIndex is larger than the queue or if current jobQueueIndex maps to no job

        if (!this.jobQueue[jobQueueIndex].lock && this.jobQueue[jobQueueIndex].progress != 1) {
          setTimeout(() => { // Spawn a new async thread for this job
            let job = this.jobQueue[jobQueueIndex]

            job.lock = true // Don't work on it again if you're already downloading it
            job.progress = 0 / job.file_size

            console.log("Working on job ", job);

            let totalSizeRecieved = 0;

            function update(delta) {
              totalSizeRecieved += delta.sizeRecieved;
              job.progress = totalSizeRecieved / job.file_size;
              job.auxiliary = size(totalSizeRecieved) + ' of ' + size(job.file_size)
            }

            job.file.download(
              this.config.activeProfile.instanceDirectory + '/mods/' + job.file_name, // Path
              true, // Overwrite existing
              update // Bind to update so that it can show progress
              ).then(path => {
                job.progress = 1;
                job.operation = "Complete";
                job.auxiliary = size(job.file_size);
                console.log(path)

              }).catch(error => {
                job.progress = 1;
                job.operation = 'Failed'
                job.auxiliary = error
              })

          }, 1) // (Spawn it after 1 ms)
        } else if (this.jobQueue[jobQueueIndex].progress == 1) {
          console.log("Traversing up the job queue");
          jobQueueIndex++; 
        }

      }, 1000)
    } else {
      console.warn("Job manager already exists!")
    }
  },

  methods: {
    createProfile(name) {
      let chosenDirectory = remote.dialog.showOpenDialog({properties: ['openDirectory']});

      if (chosenDirectory) {
        let configToSave = Object.assign({}, configTemplate)
        configToSave.activeProfile.name = name
        configToSave.activeProfile.instanceDirectory = chosenDirectory[0]

        if (!fs.existsSync(AppPath + '/profiles/' + name + '.json')) {
          fs.writeFileSync(AppPath +  '/profiles/' + name + '.json', JSON.stringify(configToSave))
        } else {
          remote.dialog.showErrorBox('Profile exists already', name + ' already exists!')
          return false;
        }

        this.$router.push('/')
        this.changeProfile(name);

        return true
      } else {
        remote.dialog.showErrorBox('No folder chosen', 'You have to choose a folder for your new profile!')
        return false
      }
    },

    downloadModFile(file) {

    },

    /*
    downloadModFile(chosen, job, update) {
      console.log(chosen);

      job.file_name = chosen.file_name; // Show the file name

      // Figure out any dependencies it might have
      for (let dependency in chosen.mod_dependencies) {
        Curseforge.getMods({mod_key: chosen.mod_dependencies[dependency]}).then((mods) => {
          this.addToJobQueue(mods[0], "Needed by " + job.name)
        });
      }

      // Download the mod
      chosen.download(this.config.activeProfile.instanceDirectory + '/mods' + "/" + chosen.file_name, {
        override: true,
        auto_check: true,
      }, 
      update).then(() => {
        job.operation = "Complete"
        job.auxiliary = size(job.filesize)
        job.progress = 1

        // Notify user
        let downloadCompleteNotification = new Notification(job.name + " has finished downloading!", {
          body: "Total size: " + size(job.filesize)
        })

        downloadCompleteNotification.onclick = () => {
          remote.getCurrentWindow().maximize();
        }

        this.addToMods(job.mod, {reason: job.reason, file_name: chosen.file_name, md5: chosen.file_md5})
        this.saveImportantToFile()

      }).catch(err => {
        job.progress = 1
        job.auxiliary = err
        job.operation = "Failed"

        let downloadCompleteNotification = new Notification(job.name + " failed to download!")

        downloadCompleteNotification.onclick = () => {
          remote.getCurrentWindow().maximize();
        }
      });
      
    },*/

    modSearch(term) {

      this.modSearchTerm = term

      console.log(this.refinedSearchFilters)
      if (this.$router.currentRoute.path !== '/search') {
        console.log("we")
        this.$router.push('/search')
      }
      
      this.modSearchResults = []
      this.noResultFound = false

      let searchFilters = Object.assign({}, this.refinedSearchFilters)
      this.refinedSearchFilters.searchFilter = this.modSearchTerm
      this.refinedSearchFilters.gameVersion = 
        this.refinedSearchFilters.gameVersion == "activeProfileVersion" ? this.config.activeProfile.version : this.refinedSearchFilters.gameVersion
      Curseforge.getMods(this.refinedSearchFilters).then((mods) => {
          if (mods.length > 0) {
            this.modSearchResults = mods;
          } else {
            this.modSearchResults = []
            this.noResultFound = true;
          }
      });
    },

    searchHome() {
      this.$router.push('/search')
      if (this.modSearchResults.length === 0) {
        this.modSearchResults = [],
        this.refinedSearchFilters.gameVersion = 
          this.refinedSearchFilters.gameVersion == "activeProfileVersion" ? this.config.activeProfile.version : this.refinedSearchFilters.gameVersion
        Curseforge.getMods(this.refinedSearchFilters).then((mods) => {this.modSearchResults = mods});
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
          md5: payload.md5,
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

    addToJobQueue(mod, reason, file) {
      if (!mod || !file) {console.error("Need mod object and file object"); return;}
      reason = reason || "User initiated";

      if (!this.config.activeProfile.instanceDirectory) {
        remote.dialog.showMessageBox({
          type: 'info',
          title: 'Select an instance directory',
          message: 'Before you can download any mods, select a Minecraft instance directory.',
        })
        if (!this.changeInstanceDirectory()) {
        remote.dialog.showMessageBox({
          type: 'error',
          title: 'No directory selected',
          message: "You didn't select a directory! Download aborted.",
        })
        return;
        }
      }

      if (this.modExistsInProfile(mod)) {
        console.warn(mod.name + " already exists in the profile, aborting");
        return;
      }

      if (this.modExistsInJobQueue(mod)) {
        console.warn(mod.name + " already exists in the job queue, aborting");
        return;
      }

      this.jobQueue.push({
        mod,
        file,
        key: mod.id,
        name: mod.name,
        file_name: path.basename(file.download_url), 
        file_size: file.file_size,
        progress: 0,
        operation: "Queued",
        reason: reason
      })


    },

    /*
    addToJobQueue(mod, reason, file) {
      if (!this.config.activeProfile.instanceDirectory) {
        remote.dialog.showMessageBox({
          type: 'info',
          title: 'Select an instance directory',
          message: 'Before you can download any mods, select a Minecraft instance directory.',
        })
        if (!this.changeInstanceDirectory()) {
        remote.dialog.showMessageBox({
          type: 'error',
          title: 'No directory selected',
          message: "You didn't select a directory! Download aborted.",
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

      if (file) {
        console.log("this is a file")
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
          file: file
        })
      } else {
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
    },*/

    removeFromJobQueue(key) {
      for (let job in this.jobQueue) {
        if (this.jobQueue[job].key == key) {
          this.jobQueue.splice(job, 1); 
        }
      }
    },

    changeInstanceDirectory() {
      let chosenDirectory = remote.dialog.showOpenDialog({properties: ['openDirectory']});
      if (chosenDirectory) {
        this.config.activeProfile.instanceDirectory = chosenDirectory[0]
        this.startProfileFolderWatcher()
        return chosenDirectory[0];
      } else {
        return null;
      }
    },

    saveImportantToFile() {
      console.log("Saving to file");
      fs.writeFileSync(AppPath +  '/profiles/' + this.config.activeProfile.name + '.json', JSON.stringify(this.config))
      fs.writeFileSync(AppPath + '/appSettings.json', JSON.stringify(this.appSettings))
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
      if (this.profileFolderWatcher) {
        console.warn("Profile folder watcher already active")
        return;
      }
      if (!fs.existsSync(this.config.activeProfile.instanceDirectory + '/mods')) {
        fs.mkdirSync(this.config.activeProfile.instanceDirectory + '/mods')
      }

      console.log("Starting new profile folder watcher for " + this.config.activeProfile.name)

      this.profileFolderWatcher = fs.watch(this.config.activeProfile.instanceDirectory + '/mods', (eventType, filename) => {
        console.log(eventType, filename)
        if (eventType == "rename") {
          if (path.extname(filename) == ".disabled") { // Something has happened to a .disabled file
            if (fs.existsSync(this.config.activeProfile.instanceDirectory + '/mods' + '/' + path.basename(filename, '.disabled'))) { // If the file now has the .jar extension
              console.warn("it was just enabled, silly me!")
              return; // It was just enabled
            } else {
              this.$eventHub.$emit('deleteMod', {file_name: filename});
            }
          } else if (path.extname(filename) == ".jar") { // Something has happened to a .jar file
            if (fs.existsSync(this.config.activeProfile.instanceDirectory + '/mods' + '/' + filename)) {
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
            } else if (fs.existsSync(this.config.activeProfile.instanceDirectory + '/mods' + '/' + filename + '.disabled')) {
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
      if (this.profileFolderWatcher) {
        delete this.profileFolderWatcher
      }
    },

    changeProfile(name) {
      this.saveImportantToFile() // Save the things that need to be persistent accross profiles
      this.stopProfileFolderWatcher() // We want to change the active directory therefore we stop the watcher

      console.log("Switching from " + this.appSettings.activeProfile + " to " + name)
      this.appSettings.activeProfile = name;
      this.config = JSON.parse(fs.readFileSync(AppPath + '/profiles/' + this.appSettings.activeProfile + '.json'))

      this.startProfileFolderWatcher()
      this.saveImportantToFile()
    },

    exportProfile() {
      /*
      let savePath = remote.dialog.showSaveDialog({});

      if (savePath) {
        let data = {}
        data.name = this.config.activeProfile.name
        data.mods = []
        data.magiVersion = remote.app.getVersion()
        data.gameVersion = this.config.activeProfile.version
        data.timestamp = Date.now()
        for (let mod in this.config.activeProfile.mods) {
          data.mods.push({
            id: this.config.activeProfile.mods[mod].id,
            md5: this.config.activeProfile.mods[mod].md5
          })
        }

        fs.writeFileSync(savePath, JSON.stringify(data))
      }
      */
    },

    importProfile() {
      let openPath = remote.dialog.showOpenDialog({properties: ['openFile']})
      openPath = openPath[0]

      if (path.extname(openPath) == '.zip') { // Probably a twitch export...
        remote.dialog.showMessageBox({
          type: 'info',
          title: 'Twitch profile import',
          message: 'Magi will start Twitch profile import! Please give me a moment.'
        })
        this.$router.push('/ImportProfileLoadingScreen')

        twitchImport.importTwitchZip(openPath, data => {
          console.log("Twitch export data read complete!");
          remote.dialog.showMessageBox({
            type: 'info',
            title: 'Complete',
            message: 'Twitch profile import complete! Please select a folder for ' + data.name + '.'
          })
          
          this.$router.go(-1);
          if (this.createProfile(data.name)) {
            data.mods.forEach(mod => {
              this.addToJobQueue(mod.mod, "Twitch profile (" + data.name + ") import", mod.file)
            })
          } else {
            console.warn("Profile creation failed, cancelling")
            remote.dialog.showMessageBox({
              type: 'info',
              title: 'Twitch import cancelled',
              message: 'Twitch profile import cancelled.'
            })
          }
        }, importStatus => {
          this.importStatus = importStatus;
        })
      }

      /*
      let profileData;
      try { 
        profileData = JSON.parse(fs.readFileSync(openPath))
        console.log(profileData)
      } catch {
        remote.dialog.showErrorBox('Invalid file', 'The JSON parse failed!')
      }

      if (profileData.magiVersion) {
        if (profileData.magiVersion == remote.app.getVersion()) {
          remote.dialog.showMessageBox({
            type: 'info',
            title: 'Wait a minute...',
            message: 'Awesome! Please select a directory for ' + profileData.name + '.'
          })
        } else {
          remote.dialog.showMessageBox({
            type: 'error',
            title: 'Wait a minute...',
            message: 'You\'re on Magi ' + remote.app.getVersion() + ' while the profile you\'re trying to import was on ' + profileData.magiVersion + '. Magi will abort for safety.'
          })
          return
        }
        if (this.createProfile(profileData.name)) {

          for (let mod in profileData.mods) {
            setTimeout(() => {
              console.log("Searching for mod " + profileData.mods[mod].id)
              Curseforge.getMod(profileData.mods[mod].id).then(modResult => {
                console.log("Found it! (" + modResult.name + ') Checking for matching hashes')
                modResult.getFiles({gameVersion: profileData.gameVersion}).then(files => {
                  for (let file in files) {
                    if (files[file].file_md5 === profileData.mods[mod].md5) {
                      console.log("found a matching hatch! awesome!")
                      //this.addToJobQueue(modResult, profileData.name + ' import', files[file]);
                    }
                  }
                })
              })
            }, 1)
          }
        } else {
          console.warn("Profile creation failed, cancelling")
        }
      } else {
        remote.dialog.showMessageBox({
          type: 'error',
          title: 'Wait a minute...',
          message: 'The JSON file you\'re trying to import doesn\'t seem to be a Magi export file! Magi will cancel the operation.'
        })
        return
      }
      */
    },

    minimize() {
      remote.getCurrentWindow().minimize()
    },

    maximize() {
      const window = remote.getCurrentWindow()
      if (window.isMaximized()) {
        window.unmaximize()
      } else {
        window.maximize()
      }
    },

    close() {
      this.saveImportantToFile();
      remote.getCurrentWindow().close();
    },

    showMessageBox(message) {
      remote.dialog.showMessageBox({
        type: 'info',
        title: 'Hi!',
        message: message
      })
    },

    readProfiles() {
      return fs.readdirSync(AppPath + '/profiles').map(value => {return path.basename(value, '.json')});
    }
  }
}

</script>

<style>

  @import url('./css/fonts.css');
  @import url('./css/font-awesome.min.css');
  @import url('./css/appStyle.css');

</style>
