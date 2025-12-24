// GH Highlight Me - Popup Script

async function loadStats() {
  try {
    const result = await chrome.storage.sync.get({
      myUsername: '',
      identifiers: []
    });
    
    document.getElementById('username').textContent = result.myUsername || 'Not set';
    document.getElementById('identifierCount').textContent = result.identifiers.length;
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
