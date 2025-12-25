// GH Highlight Me - Content Script
// Highlights usernames and identifiers on GitHub

(function() {
  'use strict';

  let config = {
    myUsername: '',
    usernameColor: '#d1ecf1',
    identifiers: []
  };

  let isProcessing = false;
  let processingQueue = [];

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

  // Load configuration from storage
  async function loadConfig() {
    try {
      // Run migration first
      await migrateStorageIfNeeded();

      const result = await chrome.storage.sync.get({
        myUsername: '',
        usernameColor: '#d1ecf1',
        identifiers: []
      });
      config = result;

      // If username is empty, try to get it from GitHub page
      if (!config.myUsername) {
        const username = getCurrentUsername();
        if (username) {
          config.myUsername = username;
          await chrome.storage.sync.set({ myUsername: username });
        }
      }

      // Ensure usernameColor has default
      if (!config.usernameColor) {
        config.usernameColor = '#d1ecf1';
      }
    } catch (error) {
      console.error('GH Highlight Me: Error loading config:', error);
    }
  }

  // Get current GitHub username from the page
  function getCurrentUsername() {
    const metaTag = document.querySelector('meta[name="user-login"]');
    if (metaTag) {
      return metaTag.getAttribute('content');
    }
    
    const avatarMenu = document.querySelector('summary[aria-label*="View profile"] img');
    if (avatarMenu) {
      const alt = avatarMenu.getAttribute('alt');
      if (alt && alt.startsWith('@')) {
        return alt.substring(1);
      }
    }
    
    return null;
  }

  // Create regex pattern for matching identifiers
  function createPattern() {
    const usernameText = config.myUsername ? [config.myUsername] : [];
    const identifierTexts = config.identifiers.map(id => id.text);
    const allIdentifiers = [...usernameText, ...identifierTexts].filter(Boolean);
    if (allIdentifiers.length === 0) return null;

    // Escape special regex characters
    const escaped = allIdentifiers.map(id => id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
  }

  // Check if element should be highlighted
  function shouldHighlight(element) {
    // Skip if already highlighted
    if (element.classList && element.classList.contains('gh-highlight-me')) {
      return false;
    }
    
    // Skip script, style, and other non-visible elements
    const tagName = element.tagName;
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OBJECT'].includes(tagName)) {
      return false;
    }
    
    // Skip input elements
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName)) {
      return false;
    }
    
    return true;
  }

  // Highlight text in a text node
  function highlightTextNode(textNode, pattern) {
    const text = textNode.textContent;
    if (!text || !pattern.test(text)) {
      return;
    }

    const parent = textNode.parentNode;
    if (!parent || !shouldHighlight(parent)) {
      return;
    }

    // Create a fragment with highlighted spans
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match;

    // Reset regex
    pattern.lastIndex = 0;

    while ((match = pattern.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
      }

      // Determine which identifier matched
      const matchedText = match[0];
      let bgColor = '#fff3cd'; // default
      let isUsername = false;

      if (config.myUsername && matchedText.toLowerCase() === config.myUsername.toLowerCase()) {
        bgColor = config.usernameColor || '#d1ecf1';
        isUsername = true;
      } else {
        // Find matching identifier
        const identifier = config.identifiers.find(
          id => id.text.toLowerCase() === matchedText.toLowerCase()
        );
        if (identifier) {
          bgColor = identifier.color || '#fff3cd';
        }
      }

      // Calculate text color for readability
      const textColor = getContrastTextColor(bgColor);

      // Add highlighted span with inline styles
      const span = document.createElement('span');
      span.className = 'gh-highlight-me';
      if (isUsername) {
        span.classList.add('gh-highlight-me-self');
      }
      span.textContent = matchedText;

      // Apply inline styles for colors
      span.style.backgroundColor = bgColor;
      span.style.color = textColor;

      fragment.appendChild(span);
      lastIndex = pattern.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
    }

    // Replace the text node with the fragment
    parent.replaceChild(fragment, textNode);
  }

  // Process an element and its children
  function processElement(element) {
    if (!element || !shouldHighlight(element)) {
      return;
    }
    
    const pattern = createPattern();
    if (!pattern) {
      return;
    }
    
    // Walk through all text nodes
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Skip empty text nodes
          if (!node.textContent.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          // Skip if parent is already highlighted or shouldn't be highlighted
          if (!shouldHighlight(node.parentNode)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    
    // Highlight all text nodes
    textNodes.forEach(textNode => {
      try {
        highlightTextNode(textNode, pattern);
      } catch (error) {
        console.error('GH Highlight Me: Error highlighting text node:', error);
      }
    });
  }

  // Debounced processing to avoid performance issues
  function scheduleProcessing() {
    if (isProcessing) {
      return;
    }
    
    isProcessing = true;
    requestAnimationFrame(() => {
      processPage();
      isProcessing = false;
    });
  }

  // Process the entire page
  function processPage() {
    if (!config.myUsername && config.identifiers.length === 0) {
      return;
    }
    
    // Target GitHub-specific content areas
    const selectors = [
      // Issues and PRs
      '.js-discussion',           // Issues and PR discussions
      '.comment-body',            // Comments
      '.timeline-comment',        // Timeline comments
      '.review-comment',          // Review comments
      '.js-issue-row',            // Issue list items
      '.js-navigation-item',      // PR list items
      '.TimelineItem-body',       // Timeline items
      '.TimelineItem',            // Timeline items container
      // Commits list page
      '[data-testid="list-view-items"]', // Commits list container
      '[data-testid="commit-row-item"]', // Individual commit row
      '.js-commits-list-item',    // Commits list item
      '.js-navigation-container', // Navigation container
      // Commits general
      '.commit-title',            // Commit titles
      '.commit-desc',             // Commit descriptions
      '.commit-message',          // Commit message on list
      '.commits-list-item',       // Commits list item
      '.markdown-title',          // Markdown title in commits
      'a.message',                // Commit message link
      '.commit-group',            // Commit group on repo page
      'li.Box-row',               // Commit rows in box
      // Authors
      'td.commit-author',         // Commit authors
      'a.commit-author',          // Commit author links
      '.author',                  // Various author elements
      '[data-hovercard-type="user"]', // User hovercard elements
      // Others
      '.Box-row',                 // Various list rows
      '.file-header',             // File headers in diffs
      // Generic containers
      '[data-hpc]',               // GitHub's new UI containers
      '.react-directory-commit-message', // React commit messages
      '#repo-content-turbo-frame', // Turbo frame content
      // Broad selectors for new GitHub UI
      '[class*="commit"]',        // Any element with commit in class
      '[class*="author"]',        // Any element with author in class
      'main [role="main"]',       // Main content role
      'main'                      // Main content area (fallback)
    ];
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        processElement(element);
      });
    });
  }

  // Observe DOM changes for PJAX/SPA navigation
  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;
    
    for (const mutation of mutations) {
      // Check if any added nodes are relevant
      if (mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            shouldProcess = true;
            break;
          }
        }
      }
      if (shouldProcess) break;
    }
    
    if (shouldProcess) {
      scheduleProcessing();
    }
  });

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      let configChanged = false;

      if (changes.myUsername) {
        config.myUsername = changes.myUsername.newValue || '';
        configChanged = true;
      }

      if (changes.usernameColor) {
        config.usernameColor = changes.usernameColor.newValue || '#d1ecf1';
        configChanged = true;
      }

      if (changes.identifiers) {
        config.identifiers = changes.identifiers.newValue || [];
        configChanged = true;
      }

      if (configChanged) {
        // Remove all existing highlights
        document.querySelectorAll('.gh-highlight-me').forEach(span => {
          const text = span.textContent;
          const textNode = document.createTextNode(text);
          span.parentNode.replaceChild(textNode, span);
        });

        // Re-process the page
        scheduleProcessing();
      }
    }
  });

  // Initialize
  async function init() {
    await loadConfig();
    
    // Process the page initially
    scheduleProcessing();
    
    // Start observing for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Re-process on popstate (browser back/forward)
    window.addEventListener('popstate', scheduleProcessing);
    
    // Re-process on pjax events (GitHub's AJAX navigation)
    document.addEventListener('pjax:end', scheduleProcessing);
    document.addEventListener('turbo:load', scheduleProcessing);
  }

  // Start the extension
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
