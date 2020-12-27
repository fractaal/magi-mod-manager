import { remote } from 'electron';
import Store from 'electron-store';
import MagiModFile from './magi-mod-file';

export default class Profile {
  name: string;
  gameVersion: string;
  mods: MagiModFile[];
  path: string;

  private store: Store;

  constructor(options: {name: string; gameVersion: string; mods?: MagiModFile[]; path: string}) {
    this.name = options.name;
    this.gameVersion = options.gameVersion;
    if (options.mods && options.mods.length > 0) {
      this.mods = options.mods.map(mod => {
        const magiModFile = new MagiModFile({
          ...mod
        })

        magiModFile.onChange = () => {
          console.log(`[profile ${this.name}] autosaving profile...`);
          this.save()
        };
        return magiModFile;
      })
    } else {
      this.mods = [];
    }
    this.path = options.path;

    this.store = new Store({name: options.name, cwd: "profiles"})
  }

  setProfilePath() {
    remote.dialog.showMessageBoxSync({title: `Selecting a path for ${this.name}`, message: `Please select a path for the "${this.name}" profile. This is where downloaded mods will save.`})
    const path = remote.dialog.showOpenDialogSync({properties: ['openDirectory']});
    if (path) {
      this.path = path[0];
      this.save();
      return path[0];
    } else {
      return null;
    }
  }

  addFile(file: MagiModFile) {
    this.mods.push(file);
    this.save();
  }

  save() {
    this.store.set({
      name: this.name,
      gameVersion: this.gameVersion,
      mods: this.mods,
      path: this.path,
    })
  }

  startProfileFolderWatcher() {
    console.log(`[profile] Starting profile folder watcher for ${this.name}`); 
  }
  
}