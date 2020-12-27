// Libraries
import {remote} from 'electron';
import curseforge from 'mc-curseforge-api';
import { promiseTimeout } from './util';

// Classes
import Profile from './objects/profile';
import JobManager from './job-manager';

// Type Definitions
import { Options } from '../interfaces';
import Job from './objects/job';
import ProfileManager from './profile-manager';


/**
 * Provides bindings from the UI library to Magi. 
 * Ideally, the business logic in Magi 2.0 should be view layer agnostic.
 */
export default class Magi {
  version = remote.app.getVersion();

  // Search state
  searchResults: Mod[] = [];

  // Internal job manager
  jobManager = new JobManager(this, 500); 

  // Profile manager
  profileManager = new ProfileManager();

  // Alert handler you can publicly override
  information = (msg: string) => {
    // meant to be overriden by view layer
  };

  // Public functions for view layer to bind to
  search = async (options: Options) => {this.searchResults = await curseforge.getMods(options)};

  download = async (identifier: number, isDependency?: boolean) => {
    const mod = await curseforge.getMod(identifier);

    let latestFileForVersion: ModFile;

    try {
      latestFileForVersion = (await curseforge.getModFiles(identifier))
      .filter(file => file.minecraft_versions.indexOf(this.profileManager.activeProfile.gameVersion) !== -1)
      .reduce((a, b) => new Date(a.timestamp) > new Date(b.timestamp) ? a : b);
    } catch(err) {
      console.warn(`[magi] Not available for your game version - ${err}`);
      this.information(`${mod.name} doesn't seem to be available for this profile's game version (${this.profileManager.activeProfile.gameVersion}).`);
      return;
    }

    console.log(latestFileForVersion);
    
    try {
      ((await promiseTimeout(1000, latestFileForVersion.getDependencies())) as Mod[]).map(dependency => this.download(dependency.id, true))
    } catch(err) {
      console.warn(`[magi] Exception in dependency retrieval - ${err}`);
    }
    
    this.sendDownloadToJobManager(mod, latestFileForVersion, isDependency);
  }

  // Private functions
  private sendDownloadToJobManager = (mod: Mod, file: ModFile, isDependency?: boolean) => {
    console.log(`[magi] Sending download ${mod.name} to job manager`);
    this.jobManager.addJob(new Job(mod.name, isDependency ? `Dependency` : `User-initiated`, `DOWNLOAD`, async function (this: Job) {
      for (let i = 0; i < 100; i++) {
        await new Promise(r => setTimeout(r, Math.random() * 100));
        this.progress = i;
        if ((Math.random() * 100).toFixed() == "80") {
          throw new Error("Connection refused");
        }
      }
    }));
  }
}