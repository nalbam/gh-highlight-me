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
- **Config loading**: Reads username, colors, and identifiers from `chrome.storage.sync`
- **Username detection**: Auto-detects logged-in user from `meta[name="user-login"]` tag
- **Text highlighting**: Uses TreeWalker to find text nodes, wraps matches in `<span class="gh-highlight-me">`
- **Color application**: Applies custom background colors via inline styles with auto-calculated text colors
- **SPA support**: MutationObserver watches for DOM changes; listens for `pjax:end` and `turbo:load` events
- **Performance**: Debounces processing with `requestAnimationFrame`

### Options Page (`options.js` / `options.html`)

Full settings page for managing username, custom identifiers, and colors:
- **Color pickers**: Individual color selection for username and each identifier
- **Live preview**: Real-time preview with custom colors applied
- **Auto-migration**: Automatically migrates old storage format to new color-enabled schema

### Popup (`popup.js` / `popup.html`)

Quick status display showing configured username with its custom color and identifier count. Links to options page.

### Styles (`highlight.css`)

Structural styles only (colors applied via JavaScript inline styles):
- `.gh-highlight-me` - Base highlighting style (border-radius, padding, font-weight)
- `.gh-highlight-me-self` - Username-specific style (border, increased font-weight)

Background and text colors are dynamically applied via inline styles:
- Background colors are customizable per username and identifier
- Text colors are auto-calculated using WCAG luminance formula for optimal contrast
- Border colors adapt to dark mode via `[data-color-mode="dark"]` and `@media (prefers-color-scheme: dark)`

### Storage

Uses `chrome.storage.sync` with keys:
- `myUsername`: string - The user's GitHub username
- `usernameColor`: string - Hex color for username highlight (default: #d1ecf1)
- `identifiers`: array of objects - Custom identifiers with individual colors
  - Each object has: `{ text: string, color: string }`
  - Example: `[{ text: "@team", color: "#fff3cd" }, { text: "urgent", color: "#ffcccc" }]`

**Migration**: Old format (`identifiers` as string array) is automatically migrated to new format with default colors.
