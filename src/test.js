const cf = require('mc-curseforge-api');

cf.getMods({pageSize: 1, searchFilter: "Quark"}).then(mods => {
  mods[0].getFiles().then(files => {
    files[0].getDependencies().then(deps => {
      console.log(deps);
    })
  })
})
