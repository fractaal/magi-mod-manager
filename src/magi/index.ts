// Libraries
import {remote} from 'electron';
import curseforge from 'mc-curseforge-api';
import { promiseTimeout } from './util';
import fs from 'fs';
import path from 'path';

// Classes
import Profile from './objects/profile';
import JobManager from './job-manager';

// Type Definitions
import { Options } from '../interfaces';
import Job from './objects/job';
import ProfileManager from './profile-manager';
import MagiModFile from './objects/magi-mod-file';


/**
 * Provides bindings from the UI library to Magi. 
 * Ideally, the business logic in Magi 2.0 should be view layer agnostic.
 */
export default class Magi {
  version = remote.app.getVersion();

  // Search state
  searchResults: Mod[] = [];

  // Internal job manager
  jobManager = new JobManager(this, 2500); 

  // Profile manager
  profileManager = new ProfileManager();

  // Alert handler you can publicly override
  information = (msg: string) => {
    // meant to be overriden by view layer
  };

  // Public functions for view layer to bind to
  search = async (options: Options) => {
    this.searchResults = [];
    this.searchResults = await curseforge.getMods(options)
  };

  download = async (identifier: number, isDependency?: boolean) => {
    const mod = await curseforge.getMod(identifier);

    if (this.profileManager.activeProfile.path === "") {
      if (this.profileManager.activeProfile.setProfilePath() === null) {
        remote.dialog.showErrorBox(`Download can't proceed`, `${mod.name} can't be downloaded because you didn't set a path.`);
        return;
      }
    }

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
    this.jobManager.addJob(new Job(mod.name, isDependency ? `Dependency` : `User-initiated`, `DOWNLOAD`, async function (this: Job, magi: Magi) {
      for (let i = 0; i < 100; i++) {
        await new Promise(r => setTimeout(r, Math.random() * 25));
        this.progress = i;
      }
      
      fs.writeFileSync(path.join(magi.profileManager.activeProfile.path, path.basename(file.download_url)), "dummy");

      magi.profileManager.activeProfile.addFile(
        new MagiModFile({
          name: mod.name,
          summary: mod.summary,
          pictureUrl: mod.logo.thumbnailUrl,
          active: true,
          downloadUrl: file.download_url,
          filePath: magi.profileManager.activeProfile.path,
          id: mod.id,
        })
      )

    }));
  }
}