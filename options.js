// Options page script for managing API keys

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settings-form');
  const geminiInput = document.getElementById('gemini-api-key');
  const weatherInput = document.getElementById('weather-api-key');
  const clearBtn = document.getElementById('clear-btn');
  const statusMessage = document.getElementById('status-message');

  // Load saved API keys
  loadApiKeys();

  // Toggle password visibility
  document.querySelectorAll('.toggle-visibility').forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const icon = button.querySelector('i');

      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });

  // Save settings
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveApiKeys();
  });

  // Clear all settings
  clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all API keys? This cannot be undone.')) {
      clearApiKeys();
    }
  });

  function loadApiKeys() {
    // Try chrome.storage.sync first, fallback to localStorage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['geminiApiKey', 'weatherApiKey'], (result) => {
        if (result.geminiApiKey) {
          geminiInput.value = result.geminiApiKey;
        }
        if (result.weatherApiKey) {
          weatherInput.value = result.weatherApiKey;
        }
      });
    } else {
      // Fallback to localStorage
      const geminiKey = localStorage.getItem('geminiApiKey');
      const weatherKey = localStorage.getItem('weatherApiKey');
      
      if (geminiKey) geminiInput.value = geminiKey;
      if (weatherKey) weatherInput.value = weatherKey;
    }
  }

  function saveApiKeys() {
    const geminiKey = geminiInput.value.trim();
    const weatherKey = weatherInput.value.trim();

    // Validate keys
    if (!geminiKey && !weatherKey) {
      showStatus('Please enter at least one API key', 'error');
      return;
    }

    // Save to chrome.storage.sync if available, otherwise localStorage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      const data = {};
      if (geminiKey) data.geminiApiKey = geminiKey;
      if (weatherKey) data.weatherApiKey = weatherKey;

      chrome.storage.sync.set(data, () => {
        if (chrome.runtime.lastError) {
          showStatus('Error saving settings: ' + chrome.runtime.lastError.message, 'error');
        } else {
          showStatus('Settings saved successfully!', 'success');
          // Notify any open tabs to reload their API keys
          if (chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ type: 'API_KEYS_UPDATED' });
          }
        }
      });
    } else {
      // Fallback to localStorage
      if (geminiKey) localStorage.setItem('geminiApiKey', geminiKey);
      if (weatherKey) localStorage.setItem('weatherApiKey', weatherKey);
      showStatus('Settings saved successfully!', 'success');
    }
  }

  function clearApiKeys() {
    // Clear from chrome.storage.sync if available, otherwise localStorage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.remove(['geminiApiKey', 'weatherApiKey'], () => {
        if (chrome.runtime.lastError) {
          showStatus('Error clearing settings: ' + chrome.runtime.lastError.message, 'error');
        } else {
          geminiInput.value = '';
          weatherInput.value = '';
          showStatus('All API keys cleared', 'success');
          // Notify any open tabs
          if (chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ type: 'API_KEYS_UPDATED' });
          }
        }
      });
    } else {
      // Fallback to localStorage
      localStorage.removeItem('geminiApiKey');
      localStorage.removeItem('weatherApiKey');
      geminiInput.value = '';
      weatherInput.value = '';
      showStatus('All API keys cleared', 'success');
    }
  }

  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;

    // Add icon
    const icon = document.createElement('i');
    icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    statusMessage.insertBefore(icon, statusMessage.firstChild);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 5000);
  }
});
