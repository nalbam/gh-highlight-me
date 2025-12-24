# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GH Highlight Me is a Chrome Extension (Manifest V3) that highlights your GitHub username and custom identifiers on issues, PRs, comments, reviews, and commits.

## Development

### Loading the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" and select the repository directory
4. Changes require clicking the refresh icon on the extension card

### No Build Step

This is a vanilla JavaScript project with no build system, bundler, or transpiler. Files are loaded directly by Chrome.

### Testing

Manual testing on GitHub pages:
- Issues: `https://github.com/{owner}/{repo}/issues/{number}`
- Pull requests: `https://github.com/{owner}/{repo}/pull/{number}`
- Commits: `https://github.com/{owner}/{repo}/commit/{sha}`

## Architecture

### Content Script (`content.js`)

The main script that runs on all `github.com/*` pages:
- **Config loading**: Reads username and identifiers from `chrome.storage.sync`
- **Username detection**: Auto-detects logged-in user from `meta[name="user-login"]` tag
- **Text highlighting**: Uses TreeWalker to find text nodes, wraps matches in `<span class="gh-highlight-me">`
- **SPA support**: MutationObserver watches for DOM changes; listens for `pjax:end` and `turbo:load` events
- **Performance**: Debounces processing with `requestAnimationFrame`

### Options Page (`options.js` / `options.html`)

Full settings page for managing username and custom identifiers. Includes live preview.

### Popup (`popup.js` / `popup.html`)

Quick status display showing configured username and identifier count. Links to options page.

### Styles (`highlight.css`)

Two highlight styles:
- `.gh-highlight-me` - Yellow background for custom identifiers
- `.gh-highlight-me-self` - Blue background for user's own username

Supports GitHub dark mode via `[data-color-mode="dark"]` and `@media (prefers-color-scheme: dark)`.

### Storage

Uses `chrome.storage.sync` with keys:
- `myUsername`: string
- `identifiers`: string[]
