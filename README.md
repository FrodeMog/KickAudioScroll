# KickAudioScroll

## Description
KickAudioScroll is a Firefox extension that allows you to use mousewheel scrolling to control audio on kick.com streams.

## How to Debug/Launch
To debug or launch the extension, follow these steps:
1. Install the [web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/) tool.
2. Run `web-ext run` in the terminal to launch the extension or press F5 in VSCode using launch.json.
3. Run `web-ext build --overwrite-dest --config-discovery` to build - and find the .zip in ***/web-ext-artifacts/***.
4. `web-ext-config.js` contains the files that are not required to build

## Resources
- [web-ext documentation](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/)

## Issues
- To allow unmute, users must allow auto audio play in Firefox's privacy settings. To do this, navigate to `about:preferences#privacy` and enable the option for "Allow audio and video autoplay."
- Audio spikes when player is unmuted.