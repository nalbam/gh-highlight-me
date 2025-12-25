// GH Highlight Me - Options Page Script

let identifiers = [];
let usernameColor = '#d1ecf1';

// Utility Functions

// Calculate black or white text color based on background brightness
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

// Validate hex color format
function isValidHexColor(color) {
  return /^#[0-9A-F]{6}$/i.test(color);
}

// Ensure color has # prefix and is uppercase
function normalizeColor(color) {
  if (!color) return '#fff3cd';
  if (color.startsWith('#')) return color.toUpperCase();
  return '#' + color.toUpperCase();
}

// Migrate old storage format to new format
async function migrateStorageIfNeeded() {
  const result = await chrome.storage.sync.get(['myUsername', 'usernameColor', 'identifiers']);

  let needsMigration = false;
  let newData = {};

  // Check if usernameColor exists
  if (!result.usernameColor && result.myUsername) {
    newData.usernameColor = '#d1ecf1'; // default blue
    needsMigration = true;
  }

  // Check if identifiers need migration
  if (result.identifiers && result.identifiers.length > 0) {
    if (typeof result.identifiers[0] === 'string') {
      // Old format detected - migrate to new format
      newData.identifiers = result.identifiers.map(text => ({
        text: text,
        color: '#fff3cd' // default yellow
      }));
      needsMigration = true;
    }
  }

  if (needsMigration) {
    await chrome.storage.sync.set(newData);
  }

  return needsMigration;
}

// Load saved settings
async function loadSettings() {
  try {
    // Run migration first
    await migrateStorageIfNeeded();

    const result = await chrome.storage.sync.get({
      myUsername: '',
      usernameColor: '#d1ecf1',
      identifiers: []
    });

    document.getElementById('myUsername').value = result.myUsername || '';
    document.getElementById('usernameColor').value = result.usernameColor || '#d1ecf1';
    usernameColor = result.usernameColor || '#d1ecf1';
    identifiers = result.identifiers || [];

    renderIdentifiers();
    updatePreview();
  } catch (error) {
    showStatus('Error loading settings: ' + error.message, 'error');
  }
}

// Render the list of identifiers
function renderIdentifiers() {
  const list = document.getElementById('identifierList');
  list.innerHTML = '';

  if (identifiers.length === 0) {
    list.innerHTML = '<li class="empty-state">No additional identifiers added yet.</li>';
    return;
  }

  identifiers.forEach((identifier, index) => {
    const li = document.createElement('li');
    li.className = 'identifier-item';

    const span = document.createElement('span');
    span.className = 'identifier-text';
    span.textContent = identifier.text;

    // Create color picker
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = 'identifier-color-picker';
    colorInput.value = identifier.color;
    colorInput.addEventListener('change', (e) => {
      updateIdentifierColor(index, e.target.value);
    });

    const button = document.createElement('button');
    button.textContent = 'Remove';
    button.onclick = () => removeIdentifier(index);

    li.appendChild(span);
    li.appendChild(colorInput);
    li.appendChild(button);
    list.appendChild(li);
  });
}

// Add a new identifier
function addIdentifier() {
  const input = document.getElementById('newIdentifier');
  const value = input.value.trim();

  if (!value) {
    return;
  }

  // Check if text already exists
  if (identifiers.some(id => id.text === value)) {
    showStatus('This identifier already exists.', 'error');
    return;
  }

  identifiers.push({
    text: value,
    color: '#fff3cd' // default yellow
  });
  input.value = '';

  renderIdentifiers();
  updatePreview();
}

// Update identifier color
function updateIdentifierColor(index, color) {
  identifiers[index].color = normalizeColor(color);
  updatePreview();
}

// Remove an identifier
function removeIdentifier(index) {
  identifiers.splice(index, 1);
  renderIdentifiers();
  updatePreview();
}

// Update the preview
function updatePreview() {
  const username = document.getElementById('myUsername').value.trim();
  const usernameColorInput = document.getElementById('usernameColor').value;
  const previewText = document.getElementById('previewText');

  if (!username && identifiers.length === 0) {
    previewText.textContent = 'Configure your username and identifiers above to see a preview.';
    return;
  }

  // Clear existing content
  previewText.innerHTML = '';

  // Create text elements safely
  const addText = (text) => {
    previewText.appendChild(document.createTextNode(text));
  };

  const addHighlight = (text, bgColor, isSelf = false) => {
    const span = document.createElement('span');
    span.className = isSelf ? 'gh-highlight-me gh-highlight-me-self' : 'gh-highlight-me';
    span.textContent = text;
    span.style.backgroundColor = bgColor;
    span.style.color = getContrastTextColor(bgColor);
    span.style.padding = '1px 3px';
    span.style.borderRadius = '3px';
    span.style.fontWeight = '500';
    if (isSelf) {
      span.style.border = '1px solid rgba(0, 0, 0, 0.1)';
      span.style.fontWeight = '600';
    }
    previewText.appendChild(span);
  };

  addText('Example GitHub comment: ');

  if (username) {
    addText('Hey ');
    addHighlight(username, usernameColorInput, true);
    addText(', ');
  }

  addText('thanks for the contribution! ');

  if (identifiers.length > 0) {
    identifiers.forEach((id, index) => {
      if (index > 0) {
        addText(', ');
      }
      addHighlight(id.text, id.color, false);
    });
    addText(' will review this.');
  }
}

// Save settings
async function saveSettings() {
  const myUsername = document.getElementById('myUsername').value.trim();
  const usernameColorValue = document.getElementById('usernameColor').value;

  try {
    await chrome.storage.sync.set({
      myUsername: myUsername,
      usernameColor: normalizeColor(usernameColorValue),
      identifiers: identifiers
    });

    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    showStatus('Error saving settings: ' + error.message, 'error');
  }
}

// Show status message
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = 'status ' + type;
  status.style.display = 'block';
  
  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}

// Event listeners
document.getElementById('saveButton').addEventListener('click', saveSettings);
document.getElementById('addIdentifier').addEventListener('click', addIdentifier);

document.getElementById('newIdentifier').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addIdentifier();
  }
});

document.getElementById('myUsername').addEventListener('input', updatePreview);
document.getElementById('usernameColor').addEventListener('input', updatePreview);

// Load settings on page load
loadSettings();
