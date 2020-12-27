import path from 'path';
import fs from 'fs';
import { TouchBarScrubber } from 'electron';

export default class MagiModFile {
  name: string;
  summary: string;
  pictureUrl: string;
  fileName: string;
  downloadUrl: string;
  filePath: string;
  id: number;
  active: boolean;

  // filePath: string, file: ModFile, mod: Mod, active?: boolean
  constructor(
    data: {
      name: string; 
      summary: string; 
      pictureUrl: string; 
      downloadUrl: string; 
      id: number; 
      filePath: string; 
      active: boolean;
    }) {
    this.name = data.name;
    this.summary = data.summary;
    this.pictureUrl = data.pictureUrl;
    this.fileName = path.basename(data.downloadUrl);
    this.downloadUrl = data.downloadUrl;
    this.id = data.id;
    this.filePath = data.filePath;
    this.active = data.active;
  }

  enable() {
    const newFileName = path.basename(this.fileName, '.disabled') + '.jar';
    fs.renameSync(path.join(this.filePath, this.fileName), path.join(this.filePath, newFileName));
    this.fileName = newFileName;
    this.active = true;
    this.onChange();
  }

  disable() {
    const newFileName = path.basename(this.fileName, '.jar') + '.disabled';
    fs.renameSync(path.join(this.filePath, this.fileName), path.join(this.filePath, newFileName));
    this.fileName = newFileName;
    this.active = false;
    this.onChange();
  }

  toggle() {
    if (this.active) this.disable(); else this.enable();
  }

  onChange = () => {
    // Overwrite this!
  };
}