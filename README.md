# Magi

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/9488cb8874834fa48affc2a2d767bde5)](https://app.codacy.com/manual/fractaal/archon-mod-manager?utm_source=github.com&utm_medium=referral&utm_content=fractaal/archon-mod-manager&utm_campaign=Badge_Grade_Dashboard)

<font color="red">Alpha stage</font>, features may break or not work at all!!!

Hi! Welcome to Magi, a Minecraft Forge mod manager that envisions to be an open-source alternative to apps like Twitch! It uses the Curseforge API to search for mods, just like Twitch, but less invasive and more transparent.

#### Powered by mc-curseforge-api
Magi's internal search function is powered by Mondanzo's mc-curseforge-api!

#### Shows you what it's downloading and why
It's not uncommon for mods to depend on other mods to run. When you download a mod, Magi searches for any dependencies that mod might have and automatically downloads those as well!

#### Lets you link .jar files downloaded from other sources
Magi automatically finds any .jar files in the mod directory it doesn't recognize and allows you to link these mods to their Curseforge counterparts (if they have one!) in the off chance that it doesn't, Magi will still recognize it in the mod list, but won't be able to auto-update it.

### Installation
Grab the latest release from the releases tab of this repository!
#### However...
If you don't trust me and you'd prefer to create your own verified installer, run the command
```
npm run electron:build
```
and, if you really really don't trust me, you can delve into the code yourself and see for yourself that I didn't do any sneaky stuff.

