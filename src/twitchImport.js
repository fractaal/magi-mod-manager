const AdmZip = require('adm-zip');
const Curseforge = require('mc-curseforge-api');

module.exports.importTwitchZip = function(path, callback, update) {
  let zip = new AdmZip(path)
  let zipEntries = zip.getEntries();

  let manifest;
  let data = {};
  let promises = [];

  zipEntries.forEach(zipEntry => {
    if (zipEntry.entryName == "manifest.json") {
      console.log("Reading manifest.json")
      manifest = JSON.parse(zipEntry.getData())
    }
  })

  console.log("Awesome! Reading relevant information...");
  data.gameVersion = manifest.minecraft.version
  data.name = manifest.name
  data.mods = []

  manifest.files.forEach(file => {
    promises.push(new Promise((resolve) => {
      Curseforge.getMod(file.projectID).then(mod => {
        update("Found mod matching project ID found in manifest.json! (" + mod.name + ")")
        mod.getFiles().then(modFiles => {
          modFiles.forEach(modFile => {
            if (modFile.id == file.fileID) {
              update("Found mod file matching file ID found in manifest.json! (" + modFile.id + ")")
              resolve({
                mod: mod,
                file: modFile
              })
            }
          })
        })
      })
    }))
  })

  Promise.all(promises).then(mods => {
    console.log("Import complete!");
    data.mods = mods;
    callback(data);
  })
}