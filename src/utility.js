module.exports.getLatestModFile = function (mod, gameVersion) {
  return new Promise((resolve, reject) => {
    if (!gameVersion) reject("No game version specified")
    mod.getFiles({}).then(files => {
      let smallestTimeDifference = Number.MAX_SAFE_INTEGER;
      let smallestTimeDifferenceFile;
  
      files.map((file) => {
        file.minecraft_versions.map(version => {
          if (version === gameVersion) {
            if (Date.now() - (Date.parse(file.timestamp)) < smallestTimeDifference) {
              smallestTimeDifference = Date.now() - Date.parse(file.timestamp)
              smallestTimeDifferenceFile = file;
            }
          }
        }) 
      }) 

      resolve(smallestTimeDifferenceFile);
    })
  })
}

/*
module.exports.download = function(path, url, update) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path)
    const request = https.get(url, response => {
      if (response.statusCode !== 200) reject("Status code not 200 (" + response.statusCode + ")");
      console.log(response.headers.location);
      response.pipe(file);
      response.on('data', chunk => {
        update({
          sizeRecieved: chunk.length
        })
      })
      file.on('finish', () => {
        file.close()
        resolve(path);
      })

      request.on('error', error => {
        console.error(error);
        fs.unlink(path)
        reject(error)
      })

      file.on('error', error => {
        console.error(error)
        fs.unlink(path)
        reject(error);
      })
    })
  })
}
*/