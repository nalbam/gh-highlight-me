// GH Highlight Me - Options Page Script

let identifiers = [];

// Load saved settings
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get({
      myUsername: '',
      identifiers: []
    });
    
    document.getElementById('myUsername').value = result.myUsername || '';
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
    span.textContent = identifier;
    
    const button = document.createElement('button');
    button.textContent = 'Remove';
    button.onclick = () => removeIdentifier(index);
    
    li.appendChild(span);
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
  
  if (identifiers.includes(value)) {
    showStatus('This identifier already exists.', 'error');
    return;
  }
  
  identifiers.push(value);
  input.value = '';
  
  renderIdentifiers();
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
  const previewText = document.getElementById('previewText');
  
  if (!username && identifiers.length === 0) {
    previewText.innerHTML = 'Configure your username and identifiers above to see a preview.';
    return;
  }
  
  let text = 'Example GitHub comment: ';
  
  if (username) {
    text += `Hey <span class="gh-highlight-me gh-highlight-me-self">${username}</span>, `;
  }
  
  text += 'thanks for the contribution! ';
  
  if (identifiers.length > 0) {
    text += identifiers.map(id => 
      `<span class="gh-highlight-me">${id}</span>`
    ).join(', ');
    text += ' will review this.';
  }
  
  previewText.innerHTML = text;
}

// Save settings
async function saveSettings() {
  const myUsername = document.getElementById('myUsername').value.trim();
  
  try {
    await chrome.storage.sync.set({
      myUsername: myUsername,
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

// Load settings on page load
loadSettings();
