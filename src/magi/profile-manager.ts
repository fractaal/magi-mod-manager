import Store from 'electron-store';

const store = new Store({name: "profiles", defaults: {
  activeProfile: {} as Profile,
  profiles: [] as Profile[],
}});

import Profile from "./objects/profile";

export default class ProfileManager {
  // Profile state
  activeProfile: Profile = {gameVersion: "1.12.2"} as Profile;
  profiles: Profile[] = [];

  constructor() {
    // No saved profiles, construct a default profile
    if(store.get("profiles").length == 0) {
      const defaultProfile = new Profile({
        name: "Default",
        gameVersion: "1.12.2",
        mods: [],
        path: ""
      })

      this.profiles.push(defaultProfile);
      this.activeProfile = defaultProfile;
    } 
  }
}