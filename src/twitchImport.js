const AdmZip = require('adm-zip');
const Curseforge = require('mc-curseforge-api');

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

module.exports.readManifest = function(path) {
  let zip = new AdmZip(path)
  let zipEntries = zip.getEntries();
  let manifest;

  zipEntries.forEach(zipEntry => {
    if (zipEntry.entryName == "manifest.json") {
      console.log("Reading manifest.json")
      manifest = JSON.parse(zipEntry.getData())
    }
  })
  return manifest;
}

module.exports.extractOverrides = function(zipPath, instanceDirectory) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let zip = new AdmZip(zipPath)
      console.log("Extracting overrides...");
      try {
        zip.extractEntryTo('overrides/', instanceDirectory, false)
        resolve(instanceDirectory)
      } catch(err) {
        console.error("Override extract failed: ", err)
        reject(err)
      }
    }, 1)
  })
}

module.exports.importTwitchZip = function(path, callback, update, error) {
  let zip = new AdmZip(path)
  let zipEntries = zip.getEntries();

  let manifest;
  let data = {};
  let promises = [];

  zipEntries.forEach(zipEntry => {
    if (zipEntry.entryName == "manifest.json") {
      update("Reading manifest.json")
      console.log("Reading manifest.json")
      manifest = JSON.parse(zipEntry.getData())
    }
  })

  console.log("Awesome! Reading relevant information...");
  update("Awesome! Reading relevant information...");
  data.gameVersion = manifest.minecraft.version
  data.name = manifest.name
  data.mods = []

  let modsFound = 0;

  manifest.files.forEach(async (file) => {
    update("Asking for project ID " + file.fileID + "'s info" + ((modsFound/manifest.files.length)*100).toFixed(0) + "% complete)")
    promises.push(new Promise((resolve) => {
      Curseforge.getMod(file.projectID).then(async (mod) => {
        update("Found mod matching project ID found in manifest.json! (" + mod.name + ")")
        mod.getFiles().then(modFiles => {
          modFiles.forEach(modFile => {
            if (modFile.id == file.fileID) {
              modsFound++
              update(
                "Found mod file matching file ID for " + 
                mod.name + "! (" + modsFound + " of " + 
                manifest.files.length + " - " + ((modsFound/manifest.files.length)*100).toFixed(0) + 
                "% complete)")
                
              resolve({
                mod: mod,
                file: modFile
              })
            }
          })
        })
      })
    }))
    await sleep(600)
  })

  Promise.all(promises).then(mods => {
    update("Import complete!")
    console.log("Done!")
    data.mods = mods;    
    callback(data);
  }).catch(reason => {
    console.error(reason)
    error(reason)
  })
}