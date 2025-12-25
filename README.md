# GH Highlight Me

A Chrome Extension (Manifest V3) that highlights your GitHub username and configurable identifiers on issues, PRs, comments, reviews, and commits.

[![build](https://img.shields.io/github/actions/workflow/status/nalbam/gh-highlight-me/push.yml?branch=main&style=for-the-badge&logo=github)](https://github.com/nalbam/gh-highlight-me/actions/workflows/push.yml)
[![release](https://img.shields.io/github/v/release/nalbam/gh-highlight-me?style=for-the-badge&logo=github)](https://github.com/nalbam/gh-highlight-me/releases)

## Features

- 🎯 **Auto-detection**: Automatically detects and highlights your GitHub username
- ⚡ **Custom Identifiers**: Add team names, usernames, or keywords to highlight
- 🎨 **Customizable Colors**: Choose custom colors for your username and each identifier
- 🔄 **SPA Support**: Works seamlessly with GitHub's PJAX/SPA navigation
- 🌙 **Dark Mode**: Full support for GitHub's dark theme with auto-contrast text
- 🚀 **Performance**: Efficient mutation observer with debouncing
- 🔒 **Privacy**: Minimal permissions, works locally

## Installation

### From Source (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/nalbam/gh-highlight-me.git
   cd gh-highlight-me
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top right)

4. Click "Load unpacked" and select the repository directory

5. The extension is now installed! Visit any GitHub page to see it in action.

### From Chrome Web Store

*Coming soon*

## Usage

### First Time Setup

1. Click the extension icon in your Chrome toolbar
2. Click "Open Settings" or right-click the extension icon and select "Options"
3. Your GitHub username should be auto-detected. If not, enter it manually.
4. Add any additional identifiers (team names, keywords, etc.)
5. Click "Save Settings"

### Adding Identifiers

In the options page, you can add:
- **Team names**: e.g., `@myteam`, `engineering-team`
- **Other usernames**: e.g., `@colleague`, `reviewer`
- **Keywords**: e.g., `urgent`, `important`, `needs-review`

### How It Works

Once configured, the extension will:
- Highlight your username with your chosen color (default: light blue #d1ecf1)
- Highlight each identifier with its own custom color (default: light yellow #fff3cd)
- Automatically calculate text color for optimal contrast and readability
- Automatically update when you navigate between GitHub pages
- Respond to real-time updates (new comments, etc.)

### Customizing Colors

1. Open the extension options page
2. Click the color picker next to your username to choose a custom color
3. Click the color picker next to any identifier to set its individual color
4. Changes are reflected in real-time in the preview
5. Click "Save Settings" to apply the colors across GitHub

## Development

### Project Structure

```
gh-highlight-me/
├── manifest.json       # Extension manifest (V3)
├── content.js          # Main content script
├── highlight.css       # Highlighting styles
├── options.html        # Options page UI
├── options.js          # Options page logic
├── popup.html          # Extension popup UI
├── popup.js            # Popup logic
└── icons/              # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Key Features Implementation

- **Content Script**: Runs on all `github.com/*` pages
- **Mutation Observer**: Watches for DOM changes to handle SPA navigation
- **Storage API**: Syncs settings across devices
- **Debouncing**: Prevents performance issues on rapid updates
- **Minimal Permissions**: Only requires `storage` and `https://github.com/*`

### Testing

Visit various GitHub pages to test:
- Issue pages: `https://github.com/{owner}/{repo}/issues/{number}`
- PR pages: `https://github.com/{owner}/{repo}/pull/{number}`
- Commit pages: `https://github.com/{owner}/{repo}/commit/{sha}`
- User profiles: `https://github.com/{username}`

## Privacy

This extension:
- ✅ Only runs on `github.com`
- ✅ Stores settings locally/synced to your Chrome account
- ✅ Does not collect or transmit any data
- ✅ Does not modify GitHub functionality
- ✅ Uses minimal permissions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Changelog

### Version 1.1.0 (Color Customization)
- 🎨 **NEW**: Customizable colors for username and identifiers
- 🎨 **NEW**: Individual color picker for each identifier
- 🎨 **NEW**: Auto-contrast text color calculation (WCAG compliant)
- 🎨 **NEW**: Real-time color preview in options page
- 🔄 **IMPROVED**: Storage schema migration for backward compatibility
- 🔄 **IMPROVED**: Enhanced options page UI with color pickers

### Version 1.0.0 (Initial Release)
- GitHub username auto-detection
- Custom identifier highlighting
- Options page for configuration
- Dark mode support
- PJAX/SPA navigation support
- Minimal permissions
- Performance optimizations
