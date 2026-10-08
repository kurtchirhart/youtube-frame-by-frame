# YouTube Frame-by-Frame Controls

A lightweight Greasemonkey/Tampermonkey userscript that adds native-style frame advance and rewind buttons to YouTube's player controls.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Supported-green.svg)

---

## Features

- **Native UI Integration**: Adds custom `<` and `>` controls directly into YouTube's left control bar alongside the play/pause button.
- **Variable Auto-Repeat Rate**: Press and hold either button to continuously step through frames.
- **Dynamic Speed Acceleration**: Holding a button smoothly accelerates frame stepping from **200 BPM** up to **400 BPM**.
- **Visual Feedback**: Flashes active buttons on every frame advance step.
- **Auto-Updates**: Integrated `@updateURL` and `@downloadURL` metadata headers so Tampermonkey updates your copy automatically on new releases.

---

## Installation

1. Install the **Tampermonkey** browser extension for your preferred browser:
   - [Chrome / Edge / Brave](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
2. Click the raw script link below to trigger Tampermonkey's auto-installer:
   - **[Install YouTube Frame-by-Frame Script](https://raw.githubusercontent.com/kurtchirhart/youtube-frame-by-frame/master/youtube-frame-by-frame-gm.js)**
3. Click **Install** when prompted by Tampermonkey.

---

## Configuration

You can customize the hold delays, BPM speeds, and visual indicators directly in the script's `CONFIG` block:

```javascript
const CONFIG = {
    minBpm: 200,                  // Starting repeat rate (BPM)
    maxBpm: 400,                  // Max repeat rate cap (BPM)
    initialDelayMs: 300,          // Hold duration before auto-repeat kicks in
    accelerationDurationMs: 600,  // Duration to scale from minBpm to maxBpm
    visualFeedback: true,         // Flash button on every tick
};
