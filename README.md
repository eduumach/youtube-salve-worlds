# YouTube English Learning Assistant

A Chrome extension that helps you learn English while watching YouTube videos. Save new words, get translations, and enhance your learning experience with interactive subtitle features.

## Features

- Save words and phrases from YouTube videos
- Get instant translations
- Enhanced subtitle display
- Word storage for later review
- Works seamlessly with YouTube's interface

## Installation

1. Clone this repository or download the ZIP file
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

1. Navigate to any YouTube video
2. Click the extension icon in your browser toolbar to access saved words
3. Interact with subtitles to save words and get translations
4. Review your saved words anytime through the extension popup

## File Structure

```
├── manifest.json        # Extension configuration
├── popup.html          # Extension popup interface
├── popup.js            # Popup functionality
├── content.js          # YouTube page integration
├── styles.css          # Extension styling
└── icons/              # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Permissions

This extension requires the following permissions:

- `activeTab`: To interact with the current YouTube page
- `storage`: To save your words and preferences
- Access to translation APIs for word translations

## Privacy

This extension only activates on YouTube.com and does not collect any personal data. All saved words are stored locally in your browser.

## Version

Current version: 1.0
