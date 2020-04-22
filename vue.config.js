module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        "appId": "com.fractal.magi",
        "productName": "Magi Mod Manager",
        "directories": {
          "buildResources": "./build"
        },
        "win" : {
          "publish": ['github']
        }
      }
    }
  }
}