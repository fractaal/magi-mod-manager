export default class Profile {
  name: string;
  gameVersion: string;
  mods: Mod[];
  path: string;

  constructor(options: {name: string, gameVersion: string, mods?: Mod[], path: string}) {
    this.name = options.name;
    this.gameVersion = options.gameVersion;
    this.mods = options.mods || [];
    this.path = options.path;
  }

  startProfileFolderWatcher() {
    console.log(`[profile] Starting profile folder watcher for ${this.name}`); 
  }
  
}