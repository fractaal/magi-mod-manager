import path from 'path'; 
import fs from 'fs';
import Store from 'electron-store';
import { remote } from 'electron';
import Profile from "./objects/profile";

const profilePath = path.join(remote.app.getPath("userData"), "profiles");

const store = new Store({name: "profiles", defaults: {
  activeProfileName: "Default",
}});

export default class ProfileManager {
  // Profile state
  activeProfile: Profile = {gameVersion: "1.12.2"} as Profile;
  activeProfileName: string;
  profiles: Profile[] = [];

  constructor() {
    // Create profiles folder if one doesn't exist yet 
    if (!fs.existsSync(profilePath)) fs.mkdirSync(profilePath);

    this.readProfiles(); 

    // No saved profiles, construct a default profile
    if(this.profiles.length == 0) {
      const defaultProfile = new Profile({
        name: "Default",
        gameVersion: "1.12.2",
        mods: [],
        path: "",
      })

      this.profiles.push(defaultProfile);
      this.activeProfile = defaultProfile;
      this.activeProfileName = "Default";

      this.saveActiveProfile();
    } else {
      this.activeProfileName = store.get("activeProfileName");

      const activeProfile = this.profiles.filter(profile => profile.name == this.activeProfileName);
      this.activeProfile = activeProfile[0];
    }
  }

  saveActiveProfile() {
    store.set({activeProfileName: this.activeProfileName})
    this.activeProfile.save();
  }

  readProfiles() {
    const profiles = fs.readdirSync(profilePath).filter(filename => filename.indexOf(".json") !== -1);
    this.profiles = profiles.map(name => {
      const data = JSON.parse(fs.readFileSync(path.join(profilePath, name), {encoding: "utf8"}));
      return new Profile({...data});
    })
  }
}