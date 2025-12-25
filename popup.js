// GH Highlight Me - Popup Script

// Utility function for text color calculation
function getContrastTextColor(hexColor) {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate relative luminance (WCAG formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

async function loadStats() {
  try {
    const result = await chrome.storage.sync.get({
      myUsername: '',
      usernameColor: '#d1ecf1',
      identifiers: []
    });

    const usernameEl = document.getElementById('username');
    usernameEl.textContent = result.myUsername || 'Not set';
    document.getElementById('identifierCount').textContent = result.identifiers.length;

    // Optional: Show username with its color
    if (result.myUsername && result.usernameColor) {
      usernameEl.style.backgroundColor = result.usernameColor;
      usernameEl.style.color = getContrastTextColor(result.usernameColor);
      usernameEl.style.padding = '2px 6px';
      usernameEl.style.borderRadius = '3px';
      usernameEl.style.fontWeight = '600';
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Open options page
document.getElementById('openOptions').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// Reload the current GitHub page
document.getElementById('reloadPage').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      // Properly validate GitHub URL
      const url = new URL(tab.url);
      if (url.hostname === 'github.com' || url.hostname.endsWith('.github.com')) {
        chrome.tabs.reload(tab.id);
        window.close();
      }
    }
  } catch (error) {
    console.error('Error reloading page:', error);
  }
});

// Load stats on popup open
loadStats();
