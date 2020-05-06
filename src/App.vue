<template>
  <div id="app" style="overflow: hidden;">
    <div class="topBarColor">
      <div style="display: flex; flex-direction: row; margin-bottom: -10px; -webkit-app-region: drag;">
        <p style="padding-top: 10px; padding-left: 10px; font-size: 16px;">Magi Mod Manager {{appVersion}}</p>
        <span style="margin-left: auto;">
          <button v-on:click="minimize" class="titleBarButton" style="position: relative; top: 0px; right: 1px;"><i class="fa fa-window-minimize"></i></button>
          <button v-on:click="maximize" class="titleBarButton" style="position: relative; top: 0px; right: 1px;"><i class="fa fa-window-maximize"></i></button>
          <button v-on:click="close" class="titleBarButton" style="position: relative; top: 0px; right: 1px;"><i class="fa fa-times fa-lg"></i></button>
        </span>
      </div>
      <div style="display: flex; padding: 20px;">
        <span style="display: flex;">
          <span>
            <img src="./assets/100px.png" style="width: 60px; height: 60px; cursor: pointer;" v-on:click="showMessageBox('I hope I don\'t crash on you')">
          </span>
          <span style="margin-left:10px;">
            <h3 class="white-text">{{config.activeProfile.name}}</h3>
            <p class="white-text" style="font-size: 14px;">{{profileStatusString}}</p>
            <p class="white-text" style="font-size: 14px;">Minecraft {{config.activeProfile.version}}</p>
          </span>
        </span>

        <div style="display: flex;">
          <button class="input" @click="() => exportImportMenu.popup()" style="height: 3.5em;"><i class="fa fa-cog fa-lg"></i></button>
          <router-link to="/"><button style="height: 3.5em;" class="input"><i class="fa fa-home fa-lg"></i></button></router-link>
          <button class="input" @click="searchHome" style="height: 3.5em;"><i class="fa fa-search fa-lg" ></i></button>
        </div>

        <div style="display: flex;">
          <TextBox :onSubmit="modSearch" placeholder="Search for new mods..." icon="fa-search"/>
        </div>
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
          <!--<keep-alive>-->
            <router-view  :mods="config.activeProfile.mods" :modSearchResults="modSearchResults" :modDetails="modDetails" 
                          :appVersion="appVersion" :changeLogs="changeLogs" :modSearchTerm="modSearchTerm" :activeProfileVersion="this.config.activeProfile.version"
                          :refinedSearchFiltersTemplate="refinedSearchFiltersTemplate" :noResultFound="noResultFound" :refinedSearchFilters="refinedSearchFilters"
                          :profiles="profiles" :config="this.config" :importStatus="importStatus" :appSettings="appSettings"/>
          <!--</keep-alive>-->
        </transition>
      </div>
      <JobQueue :jobQueue="jobQueue" :maxActiveJobs="appSettings.maxActiveJobs" :activeJobs="activeJobs" :jobQueueIndex="jobQueueIndex"></JobQueue>
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
const requestSync = require('sync-request');
const smartDownload = require('./smartDownload');

import JobQueue from './components/JobQueue'
import TextBox from './components/TextBox'

import Job from './logic/job';

const AppPath = remote.app.getPath('userData')

const appSettingsTemplate = {
  activeProfile: 'Default',
  screenSizeX: '1366',
  screenSizeY: '768',
  maxActiveJobs: 5,
  smartDownload: true,
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
      "Smart download",
    ]

    let minecraftVersions;

    // Get versions
    try {
      minecraftVersions = JSON.parse(requestSync('GET', 'https://launchermeta.mojang.com/mc/game/version_manifest.json').getBody('utf8'))
    } catch(error) {
      console.warn("Version manifest request failed! Falling back to on-disk version manifest...", error)
      try {
        minecraftVersions = JSON.parse(fs.readlinkSync(path.normalize(AppPath + '/version_manifest.json')));
      } catch (error) {
        console.error("On disk version manifest read failed! Magi can't start!")
        remote.dialog.showErrorBox("Version manifest request failed", "Online and on-disk version manifest data reads failed! Magi can't start! " + error);
        window.close();
      }
    }
    

    // Initialize this if the app has no existing configuration (first time run)
    if (!fs.existsSync(path.normalize(AppPath + '/profiles'))) {
      fs.mkdirSync(path.normalize(AppPath + '/profiles'))
    }

    if (!fs.existsSync(path.normalize(AppPath + '/appSettings.json'))) { // Profile-agnostic app settings
      fs.writeFileSync(path.normalize(AppPath + '/appSettings.json'), JSON.stringify(appSettingsTemplate))
    }

    let appSettings = JSON.parse(fs.readFileSync(path.normalize(AppPath + '/appSettings.json')))

    if (!fs.existsSync(path.normalize(AppPath + '/profiles/' + appSettings.activeProfile + '.json'))) {
      fs.writeFileSync(path.normalize(AppPath +  '/profiles/' + appSettings.activeProfile + '.json'), JSON.stringify(configTemplate))
    }

    let config = JSON.parse(fs.readFileSync(path.normalize(AppPath + '/profiles/' + appSettings.activeProfile + '.json')))
    
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
        label: "Settings...",
        click: () => {this.$router.push("/Settings")}
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
      jobQueueIndex: 0,
      activeJobs: 0,
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
          fs.unlinkSync(path.normalize(this.config.activeProfile.instanceDirectory + '/mods' + '/' + pickedMod.file_name))
        } else {
          fs.unlinkSync(path.normalize(this.config.activeProfile.instanceDirectory + '/mods' + '/' + pickedMod.file_name + '.disabled'))
        }
      } catch {
        console.warn("Mod file was already deleted or the object does not have the .enabled key");
      }

      for (let mod in this.config.activeProfile.mods) {
        if (this.config.activeProfile.mods[mod].file_name == pickedMod.file_name) {
          this.config.activeProfile.mods.splice(mod, 1);
          
          smartDownload.remove(pickedMod.file_name);

        }
      }
        this.saveImportantToFile()
    });

    // Disable mod event
    this.$eventHub.$on('disableMod', (pickedMod) => {
      if (pickedMod.enabled) {
        fs.renameSync(path.normalize(this.config.activeProfile.instanceDirectory + '/mods' + '/' + pickedMod.file_name), this.config.activeProfile.instanceDirectory + '/mods' + '/' + pickedMod.file_name + '.disabled')
          pickedMod.enabled = false
      } else {
        fs.renameSync(path.normalize(this.config.activeProfile.instanceDirectory + '/mods' + '/' + pickedMod.file_name + '.disabled'), this.config.activeProfile.instanceDirectory + '/mods' + '/' + pickedMod.file_name)
          pickedMod.enabled = true
      }
      this.saveImportantToFile()
    });

    // View mod details event
    this.$eventHub.$on('viewModDetails', async (pickedMod) => {

      this.modDetails = 'load'
      this.$router.push('/modDetails');

      if (typeof pickedMod === "number") {
        pickedMod = await this.getModFromID(pickedMod)
      }
      
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
      this.modSearch(
        this.refinedSearchFilters.searchFilter ? this.refinedSearchFilters.searchFilter : ""
      );
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
      if (!this.dangerousOperationIsOkay()) return;
      for (let change in changes) {
        console.log(
          "Updating config key " + change + 
          " from old value (" + this.config.activeProfile[change] + 
          ") to the new one (" + changes[change] + ")")

        if (change == 'name') {
          fs.renameSync(
            path.normalize(AppPath + '/profiles/' + this.config.activeProfile.name + '.json'),
            path.normalize(AppPath + '/profiles/' + changes[change] + '.json') // change the name in advance so that changeProfile doesn't break
            )
        }

        this.config.activeProfile[change] = changes[change];
      }

      this.changeProfile(this.config.activeProfile.name)
    })

    // Delete profile event
    this.$eventHub.$on('deleteProfile', () => {

      if (!this.dangerousOperationIsOkay()) return;

      remote.dialog.showMessageBox({
        type: 'warning',
        buttons: ["Delete the profile", "Delete the profile along with its folder (Deletes /mods and /config)", "No, don't delete it"],
        defaultId: 2,
        title: 'Are you really sure?',
        message: "You're about to delete " + this.config.activeProfile.name + "!"
      }, response => {
        if (response === 2) return

        if (response === 1) {
          console.warn("Performing dangerous operation!")
          try {
            fs.unlinkSync(path.normalize(this.config.activeProfile.instanceDirectory + '/mods/'))
            fs.unlinkSync(path.normalize(this.config.activeProfile.instanceDirectory + '/config/'))
          } catch(error) {
            console.warn("Dangerous operation failed ", error);
            remote.dialog.showMessageBox({
              type: 'error',
              title: 'Profile data delete failed',
              message: "Magi failed to delete the /mods and /config folder."
            })
          }
        }
        fs.unlinkSync(path.normalize(AppPath + '/profiles/' + this.config.activeProfile.name + '.json'))
        delete this.config.activeProfile; 

        this.changeProfile('Default', {save: false});
        this.$router.push('/');
      })
    })

    // Configure app settings event
    this.$eventHub.$on("changeAppSettings", newSettings => {
      for (let newSetting in newSettings) {
        this.appSettings[newSetting] = newSettings[newSetting]
      }
      console.log("New settings: ", this.appSettings)
      this.saveImportantToFile();
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
      this.profileListWatcher = fs.watch(path.normalize(AppPath + '/profiles'), () => {
        this.profiles = this.readProfiles()
      })
    } else {
      console.warn("Profile list watcher already exists")
    };
    

    this.jobQueueIndex = 0; // Job manager this.jobQueueIndex
    this.activeJobs = 0;

    let jobManager;


    // Job Manager Loop
    if (!jobManager) {
      jobManager = setInterval(() => {

        //console.log(this.jobQueue[this.jobQueueIndex]);

        if (this.jobQueue.length == 0 || this.jobQueueIndex >= (this.jobQueue.length) || !this.jobQueue[this.jobQueueIndex]) { 
          this.jobQueueIndex = 0; 
          return 
        } 
        // Don't start if job queue this.jobQueueIndex is 0; Reset this.jobQueueIndex to 0 if the this.jobQueueIndex is larger than the queue or if current this.jobQueueIndex maps to no job

        if (!this.jobQueue[this.jobQueueIndex].lock && this.jobQueue[this.jobQueueIndex].progress != 1) {
          setTimeout(() => { // Spawn a new async thread for this job

            if (this.jobQueue[this.jobQueueIndex].lock || this.jobQueue[this.jobQueueIndex].started) {
              console.warn("Wait... this job is already started!")
              return;
            }

            this.activeJobs++;
            let job = this.jobQueue[this.jobQueueIndex]
            job.lock = true // Don't work on it again if you're already downloading it
            job.started = true;
            job.progress = 0 / job.file_size
            job.operation = "Starting"

            console.log("Working on job ", job);

            let totalSizeRecieved = 0;

            function update(delta) {
              totalSizeRecieved += delta.sizeRecieved;
              job.progress = totalSizeRecieved / job.file_size;
              job.auxiliary = size(totalSizeRecieved) + ' of ' + size(job.file_size)
            }

            if (job.options.autoFindDependencies) {
              job.file.getDependencies().then(dependencies => {
                dependencies.map(dependency => {
                  let dependencyFile;
                  utility.getLatestModFile(dependency, this.config.activeProfile.version).then(latestDependencyFile => {
                    this.addToJobQueue(dependency, `Needed by ${job.mod.name}`, latestDependencyFile);
                  })
                })
              })
            }

            // Check if it already exists
            if (fs.existsSync(path.normalize(this.config.activeProfile.instanceDirectory + "/mods/" + job.file_name))) {
              job.progress = 1;
              job.operation = "Complete";
              job.auxiliary = "File already exists!";
              console.log(path)

              this.addToMods(job.mod, {reason: job.reason, file_name: job.file_name});

              this.activeJobs--

              setTimeout(() => {
                this.removeFromJobQueue(job.key)
              }, 3000)

              return;
            }

            // Check if it's available in smart download
            let smartDownloadFile = smartDownload.isAvailable(job.file_name);

            if (smartDownloadFile && this.appSettings.smartDownload) {
              console.log("Smart download available for " + job.file_name);
              try {
                fs.copyFileSync(smartDownloadFile, path.normalize(this.config.activeProfile.instanceDirectory + '/mods' + job.file_name))

                job.progress = 1;
                job.operation = "Complete";
                job.auxiliary = size(job.file_size) + " (smart download)";

                this.addToMods(job.mod, {reason: job.reason, file_name: job.file_name});

                this.activeJobs--

                setTimeout(() => {
                  this.removeFromJobQueue(job.key)
                }, 3000)

                return;

              } catch(error) {
                console.warn("Smart download: failed ", error);
                fs.unlinkSync(path.normalize(this.config.activeProfile.instanceDirectory + '/mods' + job.file_name));
              }
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

                this.addToMods(job.mod, {reason: job.reason, file_name: job.file_name});

                this.activeJobs--

                setTimeout(() => {
                  this.removeFromJobQueue(job.key)
                }, 3000)

                return;

              }).catch(error => {
                job.progress = 1;
                job.operation = 'Failed'
                job.auxiliary = error

                let notif = new Notification(`${job.mod.name} failed to download!`, {body: error}).show();

                this.activeJobs--

                return;
              })

          }, 1) // (Spawn it after 1 ms)
        } 
        
        if (this.activeJobs < this.appSettings.maxActiveJobs && this.jobQueueIndex < (this.jobQueue.length - 1)) {
          console.log("Traversing up the job queue");
          this.jobQueueIndex++; 
        } else if ((this.jobQueueIndex + 1) >= this.jobQueue.length) {
          this.jobQueueIndex = 0;
        }

      }, 250)
    } else {
      console.warn("Job manager already exists!")
    }
  },

  methods: {
    dangerousOperationIsOkay() {
      if (!(this.activeJobs === 0)) {
        remote.dialog.showErrorBox("Sorry!", "You can't do this at this time; sensitive processes are still going on!")
      }
      return this.activeJobs === 0 ? true : false
    },

    getModFromID(ID) {
      return new Promise((resolve, reject) => {
        Curseforge.getMod(ID).then(mod => {
          resolve(mod);
        }).catch(error => {
          reject(error);
        })
      })
    },

    createProfile(name, options = {navigateToHome: true}) {
      if (!this.dangerousOperationIsOkay()) return;
      let chosenDirectory = remote.dialog.showOpenDialog({properties: ['openDirectory']});

      if (chosenDirectory) {
        let configToSave = Object.assign({}, configTemplate)
        configToSave.activeProfile.name = name
        configToSave.activeProfile.instanceDirectory = chosenDirectory[0]

        if (!fs.existsSync(path.normalize(AppPath + '/profiles/' + name + '.json'))) {
          fs.writeFileSync(path.normalize(AppPath +  '/profiles/' + name + '.json'), JSON.stringify(configToSave))
        } else {
          remote.dialog.showErrorBox('Profile exists already', name + ' already exists!')
          return false;
        }

        if (options.navigateToHome) this.$router.push('/')
        this.changeProfile(name);

        return true
      } else {
        remote.dialog.showErrorBox('No folder chosen', 'You have to choose a folder for your new profile!')
        return false
      }
    },

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
      }).catch(function (reason) {
        remote.dialog.showErrorBox(
          'Error while searching', 
          reason ? reason : "There's something very wrong..."
          );
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
          logo: mod.logo ? mod.logo.thumbnailUrl : "",
          owner: mod.authors[0].name,
          blurb: mod.summary,
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
      // Add to the smart downloads list
      smartDownload.add(payload.file_name, this.config.activeProfile.instanceDirectory + "/mods/" + payload.file_name);

      this.saveImportantToFile();
    },

    addToJobQueue(mod, reason, file, options = {autoFindDependencies: true}) {
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
        reason: reason,
        lock: false,
        started: false,
        options,
      })
    },

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
      fs.writeFileSync(path.normalize(AppPath +  '/profiles/' + this.config.activeProfile.name + '.json'), JSON.stringify(this.config))
      fs.writeFileSync(path.normalize(AppPath + '/appSettings.json'), JSON.stringify(this.appSettings))
      smartDownload.save();
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
      if (!fs.existsSync(path.normalize(this.config.activeProfile.instanceDirectory + '/mods'))) {
        fs.mkdirSync(path.normalize(this.config.activeProfile.instanceDirectory + '/mods'))
      }

      console.log("Starting new profile folder watcher for " + this.config.activeProfile.name)

      this.profileFolderWatcher = fs.watch(path.normalize(this.config.activeProfile.instanceDirectory + '/mods'), (eventType, filename) => {
        console.log(eventType, filename)
        if (eventType == "rename") {
          if (path.extname(filename) == ".disabled") { // Something has happened to a .disabled file
            if (fs.existsSync(path.normalize(this.config.activeProfile.instanceDirectory + '/mods' + '/' + path.basename(filename, '.disabled')))) { // If the file now has the .jar extension
              console.warn("it was just enabled, silly me!")
              return; // It was just enabled
            } else {
              this.$eventHub.$emit('deleteMod', {file_name: filename});
            }
          } else if (path.extname(filename) == ".jar") { // Something has happened to a .jar file
            if (fs.existsSync(path.normalize(this.config.activeProfile.instanceDirectory + '/mods' + '/' + filename))) {
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
            } else if (fs.existsSync(path.normalize(this.config.activeProfile.instanceDirectory + '/mods' + '/' + filename + '.disabled'))) {
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

    changeProfile(name, options = {save: true}) {
      if (!this.dangerousOperationIsOkay()) return;
      if (options.save) { this.saveImportantToFile() } // Save the things that need to be persistent accross profiles
      this.stopProfileFolderWatcher() // We want to change the active directory therefore we stop the watcher

      console.log("Switching from " + this.appSettings.activeProfile + " to " + name)
      this.appSettings.activeProfile = name;
      this.config = JSON.parse(fs.readFileSync(path.normalize(AppPath + '/profiles/' + this.appSettings.activeProfile + '.json')))

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
        this.$router.push('/ImportProfileLoadingScreen')
        this.importStatus = "Warming up..."

        setTimeout(() => {
          this.importStatus = "Reading manifest..."
          let manifest = twitchImport.readManifest(openPath)
          
          remote.dialog.showMessageBox({
            type: 'info',
            title: 'Twitch Profile Import',
            message: 'Awesome! Magi can read Twitch profile exports. Please select a folder for ' + manifest.name + '.'
          })

          if (this.createProfile(manifest.name, {navigateToHome: false})) {
            this.importStatus = "Extracting overrides..."

            twitchImport.extractOverrides(openPath, this.config.activeProfile.instanceDirectory).then(() => {
              this.importStatus = "Override extraction complete!"

              twitchImport.importTwitchZip(openPath, data => {
                data.mods.forEach(mod => {
                  this.addToJobQueue(mod.mod, "Twitch profile import", mod.file, {autoFindDependencies: false});
                })
                this.$router.go(-1);
              }, update => {
                this.importStatus = update
              }, error => {
                this.importStatus = error
                remote.dialog.showMessageBox({
                  type: 'error',
                  title: 'Twitch import failed',
                  message: error,
                })
                this.$router.go(-1)
              })
            }, error => {
              this.importStatus = error
              remote.dialog.showMessageBox({
                type: 'error',
                title: 'Twitch import failed',
                message: error,
              })
              this.$router.go(-1)
            })


          } else {
            console.warn("Profile creation failed, cancelling")
            remote.dialog.showMessageBox({
              type: 'info',
              title: 'Twitch import cancelled',
              message: 'Twitch profile import cancelled.'
            })
            this.$router.go(-1)
          }
        }, 2000);
      }
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
      return fs.readdirSync(path.normalize(AppPath + '/profiles')).map(value => {return path.basename(value, '.json')});
    }
  },

  computed: {
    profileStatusString() {
      let enabledMods = 0;
      let disabledMods = 0;
      this.config.activeProfile.mods.map(mod => {
        if (mod.enabled) enabledMods++;
        else disabledMods++;
      })
      return `${enabledMods} active mods, ${disabledMods} disabled`
    }
  }
}

</script>

<style>

  @import url('./css/fonts.css');
  @import url('./css/font-awesome.min.css');
  @import url('./css/appStyle.css');

</style>
