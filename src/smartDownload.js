
const { remote } = require("electron");
const fs = require("fs");
const path = require("path");

const smartDownloadDataTemplate = [];

let AppPath = remote.app.getPath("userData");
let smartDownloadData = [];

if (!fs.existsSync(path.normalize(AppPath + '/smartDownload.json'))) {
  fs.writeFileSync(path.normalize(AppPath + '/smartDownload.json'), JSON.stringify(smartDownloadDataTemplate));
}

smartDownloadData = JSON.parse(fs.readFileSync(path.normalize(AppPath + '/smartDownload.json')));


module.exports = {
  /**
   * Let a file be available for smart download
   *
   * @param {*} filename - Filename you want to add
   * @param {*} fullPath - Full path of the file
   * 
   * @returns {true} - Always, because this shouldn't fail at all
   * 
   */
  add: function (filename, fullPath) {
    
    for (let entry in smartDownloadData) {
      if (smartDownloadData[entry].filename === filename) {
        smartDownloadData[entry].instances++;
        return true, "INSTANCE_ADD"
      }
    }

    smartDownloadData.push({
      filename: filename,
      fullPath: path.normalize(fullPath),
      instances: 1,
    })
    return true, "FIRST_ADD"
  },

  /**
   * Stop a file from being available for smart download
   *
   * @param {*} filename - Filename you want to remove
   * @returns {Boolean} - True / false based on success of operation
   */
  remove: function (filename) {
    for (let entry in smartDownloadData) {
      if (smartDownloadData[entry].filename === filename) {
        if (smartDownloadData[entry].instances !== 1) {
          smartDownloadData[entry].instances--;
          return true, "INSTANCE_REMOVAL"
        } else {
          delete smartDownloadData[entry];
          return true, "TOTAL_REMOVAL"
        }
      }
    }
    return false;
  },

  /**
   * Checks if a filename is on the smart download list
   *
   * @param {*} filename - The filename you want to check
   * @returns {false | String} - false if no match, string of the full path if matched 
   */
  isAvailable: function (filename) {
    for (let entry in smartDownloadData) {
      if (smartDownloadData[entry].filename === filename) {
        return smartDownloadData[entry].fullPath;
      }
    }
    return false;
  },

  save: function () {
    try {
      fs.writeFileSync(path.normalize(AppPath + "/smartDownload.json"), JSON.stringify(smartDownloadData));
      return true;
    } catch(error) {
      return error;
    }
  }
}