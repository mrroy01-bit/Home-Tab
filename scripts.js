const AppState = {
  todos: [],
  quickLinks: [],
  settings: {
      theme: 'ocean',
      customBackground: null,
      searchEngine: 'google',
      taskSort: 'created',
      currentTaskPriority: 'medium',
      currentTaskCategory: 'general',
      userName: '',
      weatherLocation: '',
      bgBlur: '5'
  },
  // Simplified search engine configuration
  searchEngines: {
      google: { name: 'Google', icon: 'fab fa-google', url: 'https://google.com/search', queryParam: 'q' },
      bing: { name: 'Bing', icon: 'fab fa-microsoft', url: 'https://www.bing.com/search', queryParam: 'q' },
      duckduckgo: { name: 'DuckDuckGo', icon: 'fab fa-duckduckgo', url: 'https://duckduckgo.com/', queryParam: 'q' }
  },
  // Available icons for quick links modal
  quickLinkIcons: [
      { value: 'fas fa-link', text: 'General Link' }, { value: 'fas fa-globe', text: 'Website' },
      { value: 'fas fa-star', text: 'Favorite' }, { value: 'fas fa-folder', text: 'Folder' },
      { value: 'fab fa-github', text: 'GitHub' }, { value: 'fab fa-gitlab', text: 'GitLab' },
      { value: 'fab fa-google', text: 'Google' }, { value: 'fab fa-youtube', text: 'YouTube' },
      { value: 'fab fa-twitter', text: 'Twitter / X' }, { value: 'fab fa-facebook', text: 'Facebook' },
      { value: 'fab fa-instagram', text: 'Instagram' }, { value: 'fab fa-linkedin', text: 'LinkedIn' },
      { value: 'fab fa-slack', text: 'Slack' }, { value: 'fab fa-figma', text: 'Figma' },
      { value: 'fab fa-codepen', text: 'CodePen' }, { value: 'fas fa-envelope', text: 'Email' },
      { value: 'fas fa-calendar', text: 'Calendar' }, { value: 'fas fa-book', text: 'Docs / Read' },
      { value: 'fas fa-code', text: 'Code / Dev' }, { value: 'fas fa-cloud', text: 'Cloud / Drive' },
      { value: 'fas fa-shopping-cart', text: 'Shopping' }, { value: 'fas fa-music', text: 'Music' },
      { value: 'fas fa-video', text: 'Video / Stream' }, { value: 'fas fa-image', text: 'Photos / Images' },
      { value: 'fas fa-file-alt', text: 'Documents' }, { value: 'fas fa-chart-bar', text: 'Analytics' },
      { value: 'fas fa-cog', text: 'Settings' }, { value: 'fas fa-briefcase', text: 'Work' },
      { value: 'fas fa-graduation-cap', text: 'School' }, { value: 'fas fa-gamepad', text: 'Games' }
  ],
  // Default quick links if none are loaded
  defaultQuickLinks: [
      { name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'fas fa-robot', color: '#10a37f' },
      { name: 'GitHub', url: 'https://github.com', icon: 'fab fa-github', color: '#333333' },
      { name: 'Gmail', url: 'https://mail.google.com', icon: 'fas fa-envelope', color: '#ea4335' },
      { name: 'YouTube', url: 'https://youtube.com', icon: 'fab fa-youtube', color: '#ff0000' },
      { name: 'Gemini', url: 'https://gemini.google.com', icon: 'fas fa-gem', color: '#8e24aa' }
  ],
  domRefs: {}, 
  draggedLinkElement: null,
  weatherApiKey: '89ac0963d98ecf5cef698592b36e0300', // Sample key - replace with your own from OpenWeatherMap
};

// --- DOM Element Caching ---
function cacheDomReferences() {
  AppState.domRefs = {
      // Main Layout
      htmlElement: document.documentElement,
      bodyElement: document.body,
      sidebarElement: document.getElementById('sidebar'),
      sidebarToggle: document.getElementById('sidebar-toggle'),
      closeSidebarBtn: document.getElementById('close-sidebar'),
      
      // Header & Theme
      clock: document.getElementById('clock'),
      date: document.getElementById('date'),
      weatherDisplay: document.getElementById('temperature'),
      themeColorMeta: document.querySelector('meta[name="theme-color"]'),
      greeting: document.getElementById('greeting'),
      motivation: document.getElementById('motivation'),
      themeToggleBtn: document.getElementById('theme-toggle'),
      themeOptions: document.querySelectorAll('.theme-option'),
      
      // Search
      searchEngineButton: document.getElementById('search-engine-button'),
      searchEngineIcon: document.getElementById('search-engine-icon'),
      searchEngineDropdown: document.getElementById('search-engine-dropdown'),
      searchEngineOptions: document.querySelectorAll('.search-engine-option'),
      searchForm: document.getElementById('search-form'),
      searchInput: document.getElementById('search-input'),
      searchBtn: document.getElementById('search-btn'),
      sendBtn: document.getElementById('send-btn'),
      attachBtn: document.getElementById('attach-btn'),
      voiceBtn: document.getElementById('voice-btn'),
      chatContainer: document.getElementById('chat-container'),

      // Quick Links
      quickLinksGrid: document.getElementById('quick-links-grid'),
      quickLinksList: document.querySelector('.quick-links-list'),
      addLinkButtons: document.querySelectorAll('.add-quick-link'),
      addLinkModal: document.getElementById('add-link-modal'),
      addLinkForm: document.getElementById('add-link-form'),
      closeLinkModalBtn: document.getElementById('close-link-modal'),
      cancelLinkBtn: document.getElementById('cancel-link-btn'),
      saveLinkBtn: document.getElementById('save-link-btn'),
      linkNameInput: document.getElementById('link-name'),
      linkUrlInput: document.getElementById('link-url'),
      iconSelect: document.getElementById('icon-select'),
      iconPreview: document.getElementById('icon-preview'),
      linkColorInput: document.getElementById('link-color'),
      modalTitle: document.getElementById('modal-title'),

      // Settings
      settingsBtn: document.getElementById('settings-btn'),
      settingsModal: document.getElementById('settings-modal'),
      closeSettingsModalBtn: document.getElementById('close-settings-modal'),
      customBgUpload: document.getElementById('custom-bg-upload'),
      customBgBtn: document.getElementById('custom-bg-btn'),
      resetBgBtn: document.getElementById('reset-bg-btn'),
      blurAmount: document.getElementById('blur-amount'),
      blurValue: document.getElementById('blur-value'),
      userNameInput: document.getElementById('user-name'),
      weatherLocationInput: document.getElementById('weather-location'),
      resetSettingsBtn: document.getElementById('reset-settings-btn'),
      saveSettingsBtn: document.getElementById('save-settings-btn'),
  };
  
  // Log any missing DOM references to help with debugging
  for (const [key, value] of Object.entries(AppState.domRefs)) {
    if (!value && key !== 'draggedLinkElement') {
      console.warn(`Missing DOM reference: ${key}`);
    }
  }
}

// --- Data Persistence (LocalStorage) ---

/** Loads data (links, settings) from localStorage */
function loadData() {
  try {
      const storedLinks = localStorage.getItem('app_quickLinks');
      AppState.quickLinks = storedLinks ? JSON.parse(storedLinks) : [...AppState.defaultQuickLinks]; // Use default if none stored
  } catch (e) {
      console.error("Error loading quick links:", e);
      AppState.quickLinks = [...AppState.defaultQuickLinks];
  }

  try {
      const storedSettings = localStorage.getItem('app_settings');
      if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          // Merge stored settings with defaults to handle missing keys
          AppState.settings = { ...AppState.settings, ...parsedSettings };
      }
      // Ensure essential settings have defaults if missing entirely
      AppState.settings.theme = AppState.settings.theme || 'ocean';
      AppState.settings.searchEngine = AppState.settings.searchEngine || 'google';

  } catch (e) {
      console.error("Error loading settings:", e);
      // Keep default settings if loading fails
  }
  console.log("Data loaded:", { quickLinks: AppState.quickLinks, settings: AppState.settings });
}

/** Saves the entire AppState (or specific parts) to localStorage */
function saveData(part = 'all') {
  try {
      if (part === 'all' || part === 'quickLinks') {
          localStorage.setItem('app_quickLinks', JSON.stringify(AppState.quickLinks));
      }
      if (part === 'all' || part === 'settings') {
          localStorage.setItem('app_settings', JSON.stringify(AppState.settings));
      }
  } catch (e) {
      console.error("Error saving data to localStorage:", e);
  }
}

// --- Theme Management ---

/** Updates the UI to match the current theme */
function applyTheme(themeName) {
  const { htmlElement, themeColorMeta } = AppState.domRefs;
  
  // Set the theme attribute on html
  htmlElement.setAttribute('data-theme', themeName);
  
  // Update theme meta tag color
  let themeColor = '#1a4f60'; // Default ocean color
  
  // Set the correct theme color for system UI based on theme
  switch(themeName) {
    case 'light': themeColor = '#f5f5f5'; break;
    case 'dark': themeColor = '#121212'; break;
    case 'forest': themeColor = '#22592e'; break;
    case 'sunset': themeColor = '#ff6f61'; break;
    case 'midnight': themeColor = '#2c3e50'; break;
    case 'ocean': default: themeColor = '#1a4f60'; break;
  }
  
  if (themeColorMeta) {
    themeColorMeta.content = themeColor;
  }
  
  // Update active class on theme options
  document.querySelectorAll('.theme-option').forEach(button => {
    if (button.getAttribute('data-theme') === themeName) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
  
  // Save theme in settings
  AppState.settings.theme = themeName;
  saveData('settings');
}

/** Sets up the theme switcher functionality */
function setupThemeSwitcher() {
  const { themeOptions, themeToggleBtn } = AppState.domRefs;
  
  // Apply the saved theme on load
  applyTheme(AppState.settings.theme);
  
  // Set up theme option buttons
  if (themeOptions) {
    themeOptions.forEach(button => {
      button.addEventListener('click', () => {
        const themeName = button.getAttribute('data-theme');
        if (themeName) {
          applyTheme(themeName);
        }
      });
    });
  }
  
  // Set up theme toggle button
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const themes = ['light', 'dark', 'ocean', 'forest', 'sunset', 'midnight'];
      const currentThemeIndex = themes.indexOf(AppState.settings.theme);
      const nextThemeIndex = (currentThemeIndex + 1) % themes.length;
      applyTheme(themes[nextThemeIndex]);
    });
  }
}

// --- Time & Date Management ---

/** Updates the clock and date displays */
function updateTimeAndDate() {
  const { clock, date } = AppState.domRefs;
  
  if (!clock || !date) return;
  
  const now = new Date();
  
  // Update clock display
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  clock.textContent = `${hours}:${minutes}`;
  
  // Update date display
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  date.textContent = now.toLocaleDateString(undefined, options);
  
  // Update greeting based on time of day
  updateGreeting(now.getHours());
}

/** Updates the greeting message based on time of day */
function updateGreeting(hour) {
  const { greeting } = AppState.domRefs;
  
  if (!greeting) return;
  
  let greetingText = 'Hello';
  
  if (hour < 12) {
    greetingText = 'Good morning';
  } else if (hour < 18) {
    greetingText = 'Good afternoon';
  } else {
    greetingText = 'Good evening';
  }
  
  // Add user name if available
  const userName = AppState.settings.userName;
  if (userName) {
    greetingText += `, ${userName}`;
  }
  
  greeting.textContent = greetingText;
}

// --- Weather Management ---

/** Fetches weather data for the configured location */
async function fetchWeather() {
  const { weatherDisplay } = AppState.domRefs;
  
  if (!weatherDisplay) return;
  
  try {
    const location = AppState.settings.weatherLocation || 'auto:ip'; // Default to IP-based location
    const apiKey = AppState.weatherApiKey;
    
    // Handle default case with browser geolocation
    if (location === 'auto:ip' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`);
        const data = await response.json();
        updateWeatherDisplay(data);
      }, (error) => {
        console.error('Geolocation error:', error);
        weatherDisplay.textContent = '--°';
      });
    } else {
      // Use specified location
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${apiKey}`);
      const data = await response.json();
      updateWeatherDisplay(data);
    }
  } catch (error) {
    console.error('Weather fetch error:', error);
    weatherDisplay.textContent = '--°';
  }
}

/** Updates the weather display with fetched data */
function updateWeatherDisplay(data) {
  const { weatherDisplay } = AppState.domRefs;
  
  if (!weatherDisplay || !data || !data.main) return;
  
  const temp = Math.round(data.main.temp);
  weatherDisplay.textContent = `${temp}°C`;
  
  // Update weather icon
  const weatherIcon = document.querySelector('#weather i');
  if (weatherIcon) {
    const weatherCode = data.weather[0].id;
    let iconClass = 'fas fa-cloud'; // Default icon
    
    // Map weather codes to Font Awesome icons
    if (weatherCode >= 200 && weatherCode < 300) {
      iconClass = 'fas fa-bolt'; // Thunderstorm
    } else if (weatherCode >= 300 && weatherCode < 400) {
      iconClass = 'fas fa-cloud-rain'; // Drizzle
    } else if (weatherCode >= 500 && weatherCode < 600) {
      iconClass = 'fas fa-cloud-showers-heavy'; // Rain
    } else if (weatherCode >= 600 && weatherCode < 700) {
      iconClass = 'fas fa-snowflake'; // Snow
    } else if (weatherCode >= 700 && weatherCode < 800) {
      iconClass = 'fas fa-smog'; // Atmosphere (fog, etc.)
    } else if (weatherCode === 800) {
      iconClass = 'fas fa-sun'; // Clear sky
    } else if (weatherCode > 800) {
      iconClass = 'fas fa-cloud-sun'; // Clouds
    }
    
    // Remove all icon classes and add the correct one
    weatherIcon.className = '';
    weatherIcon.classList.add(...iconClass.split(' '));
  }
}

// --- Search Functionality ---

/** Sets up the search functionality */
function setupSearch() {
  const { 
    searchEngineButton, searchEngineDropdown, searchEngineOptions, 
    searchEngineIcon, searchForm, searchInput, searchBtn, sendBtn 
  } = AppState.domRefs;
  
  // Update search engine display
  updateSearchEngineDisplay();
  
  // Toggle search engine dropdown
  if (searchEngineButton && searchEngineDropdown) {
    searchEngineButton.addEventListener('click', (e) => {
      e.preventDefault();
      searchEngineDropdown.classList.toggle('active');
      e.stopPropagation();
    });
    
    // Close dropdown when clicking elsewhere
    document.addEventListener('click', () => {
      searchEngineDropdown.classList.remove('active');
    });
  }
  
  // Search engine selection
  if (searchEngineOptions) {
    searchEngineOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        const engine = option.getAttribute('data-engine');
        if (engine) {
          AppState.settings.searchEngine = engine;
          saveData('settings');
          updateSearchEngineDisplay();
          searchEngineDropdown.classList.remove('active');
        }
      });
    });
  }
  
  // Handle search form submission
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      performSearch();
    });
  }
  
  // Search button click
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      performSearch();
    });
  }
  
  // Send button for AI query
  if (sendBtn) {
    sendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleAIQuery();
    });
  }
}

/** Updates the search engine icon and tooltip */
function updateSearchEngineDisplay() {
  const { searchEngineIcon } = AppState.domRefs;
  
  if (!searchEngineIcon) return;
  
  const engine = AppState.settings.searchEngine;
  const engineData = AppState.searchEngines[engine];
  
  if (engineData) {
    searchEngineIcon.className = engineData.icon;
    searchEngineIcon.setAttribute('title', engineData.name);
    
    // Also update active state in dropdown
    document.querySelectorAll('.search-engine-option').forEach(option => {
      if (option.getAttribute('data-engine') === engine) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }
}

/** Performs a web search using the selected search engine */
function performSearch() {
  const { searchInput } = AppState.domRefs;
  
  if (!searchInput || !searchInput.value.trim()) return;
  
  const engine = AppState.settings.searchEngine;
  const engineData = AppState.searchEngines[engine];
  
  if (engineData) {
    const searchTerm = encodeURIComponent(searchInput.value.trim());
    const searchUrl = `${engineData.url}?${engineData.queryParam}=${searchTerm}`;
    window.open(searchUrl, '_blank');
  }
}

/** Handles AI query submission */
function handleAIQuery() {
  const { searchInput, chatContainer } = AppState.domRefs;
  
  if (!searchInput || !chatContainer || !searchInput.value.trim()) return;
  
  // Get user's query
  const query = searchInput.value.trim();
  
  // Create user message element
  const userMessage = document.createElement('div');
  userMessage.className = 'chat-message user-message';
  userMessage.innerHTML = `
    <div class="message-avatar">
      <i class="fas fa-user"></i>
    </div>
    <div class="message-content">
      <p>${query}</p>
    </div>
  `;
  
  // Create AI response (placeholder)
  const aiMessage = document.createElement('div');
  aiMessage.className = 'chat-message ai-message';
  aiMessage.innerHTML = `
    <div class="message-avatar">
      <i class="fas fa-robot"></i>
    </div>
    <div class="message-content">
      <p>I'm sorry, but I'm just a demo. For real AI assistance, you might want to connect this to an API like OpenAI's GPT or Google's Gemini.</p>
    </div>
  `;
  
  // Remove welcome message if it exists
  const welcomeMessage = chatContainer.querySelector('.welcome-message');
  if (welcomeMessage) {
    welcomeMessage.remove();
  }
  
  // Add messages to chat
  chatContainer.appendChild(userMessage);
  setTimeout(() => {
    chatContainer.appendChild(aiMessage);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 500);
  
  // Clear search input
  searchInput.value = '';
}

// --- Quick Links Management ---

/** Sets up quick links functionality */
function setupQuickLinks() {
  const { 
    quickLinksGrid, quickLinksList, addLinkButtons, 
    addLinkModal, addLinkForm, closeLinkModalBtn, cancelLinkBtn,
    linkNameInput, linkUrlInput, iconSelect, iconPreview, linkColorInput
  } = AppState.domRefs;
  
  // Render quick links
  renderQuickLinks();
  
  // Set up modal for adding/editing links
  if (addLinkButtons) {
    addLinkButtons.forEach(button => {
      button.addEventListener('click', openAddLinkModal);
    });
  }
  
  if (closeLinkModalBtn) {
    closeLinkModalBtn.addEventListener('click', closeAddLinkModal);
  }
  
  if (cancelLinkBtn) {
    cancelLinkBtn.addEventListener('click', closeAddLinkModal);
  }
  
  // Update icon preview when selection changes
  if (iconSelect && iconPreview) {
    iconSelect.addEventListener('change', () => {
      const iconClass = iconSelect.value;
      iconPreview.innerHTML = `<i class="${iconClass}"></i>`;
    });
  }
  
  // Handle form submission
  if (addLinkForm) {
    addLinkForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveQuickLink();
    });
  }
}

/** Opens the add/edit link modal */
function openAddLinkModal(e, linkToEdit = null) {
  const { 
    addLinkModal, modalTitle, linkNameInput, linkUrlInput, 
    iconSelect, iconPreview, saveLinkBtn, linkColorInput
  } = AppState.domRefs;
  
  // Reset form and set up for add/edit
  addLinkForm.reset();
  
  if (linkToEdit) {
    // Edit mode
    modalTitle.textContent = 'Edit Quick Link';
    saveLinkBtn.textContent = 'Save Changes';
    
    // Fill form with existing data
    linkNameInput.value = linkToEdit.name;
    linkUrlInput.value = linkToEdit.url;
    
    // Select icon
    const iconOption = Array.from(iconSelect.options).find(option => option.value === linkToEdit.icon);
    if (iconOption) {
      iconOption.selected = true;
    }
    
    // Update preview
    iconPreview.innerHTML = `<i class="${linkToEdit.icon}"></i>`;
    
    // Set color if it exists
    if (linkToEdit.color) {
      linkColorInput.value = linkToEdit.color;
    }
    
    // Store the index of the link being edited
    addLinkForm.dataset.editIndex = AppState.quickLinks.indexOf(linkToEdit);
  } else {
    // Add mode
    modalTitle.textContent = 'Add Quick Link';
    saveLinkBtn.textContent = 'Add Link';
    
    // Reset preview
    iconPreview.innerHTML = `<i class="${iconSelect.value}"></i>`;
    
    // Remove edit index
    delete addLinkForm.dataset.editIndex;
  }
  
  // Open the modal
  addLinkModal.classList.add('active');
}

/** Closes the add/edit link modal */
function closeAddLinkModal() {
  const { addLinkModal } = AppState.domRefs;
  addLinkModal.classList.remove('active');
}

/** Saves the quick link from the modal form */
function saveQuickLink() {
  const { linkNameInput, linkUrlInput, iconSelect, linkColorInput, addLinkForm } = AppState.domRefs;
  
  // Get form values
  const name = linkNameInput.value.trim();
  let url = linkUrlInput.value.trim();
  const icon = iconSelect.value;
  const color = linkColorInput.value;
  
  // Validate URL format
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  // Create link object
  const linkData = { name, url, icon, color };
  
  // Check if editing or adding
  const editIndex = addLinkForm.dataset.editIndex;
  
  if (editIndex !== undefined) {
    // Edit existing link
    AppState.quickLinks[editIndex] = linkData;
  } else {
    // Add new link
    AppState.quickLinks.push(linkData);
  }
  
  // Save and render updates
  saveData('quickLinks');
  renderQuickLinks();
  closeAddLinkModal();
}

/** Renders quick links in both the grid and sidebar list */
function renderQuickLinks() {
  const { quickLinksGrid, quickLinksList } = AppState.domRefs;
  
  // Render in the main grid
  if (quickLinksGrid) {
    quickLinksGrid.innerHTML = '';
    
    AppState.quickLinks.forEach((link, index) => {
      const linkCard = document.createElement('div');
      linkCard.className = 'quick-link-card';
      linkCard.innerHTML = `
        <div class="quick-link-card-header" style="background-color: ${link.color || 'rgba(0, 0, 0, 0.2)'}">
          <i class="${link.icon} quick-link-card-icon" style="color: ${link.color ? '#ffffff' : 'var(--accent-color)'}"></i>
          <div class="quick-link-card-actions">
            <button class="quick-link-action edit" title="Edit link">
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button class="quick-link-action delete" title="Delete link">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <a href="${link.url}" class="quick-link-card-body" target="_blank">
          <span class="quick-link-card-title">${link.name}</span>
        </a>
      `;
      
      // Add edit functionality
      const editBtn = linkCard.querySelector('.edit');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openAddLinkModal(e, link);
        });
      }
      
      // Add delete functionality
      const deleteBtn = linkCard.querySelector('.delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (confirm(`Delete "${link.name}" from your quick links?`)) {
            AppState.quickLinks.splice(index, 1);
            saveData('quickLinks');
            renderQuickLinks();
          }
        });
      }
      
      quickLinksGrid.appendChild(linkCard);
    });
  }
  
  // Render in the sidebar list
  if (quickLinksList) {
    quickLinksList.innerHTML = '';
    
    AppState.quickLinks.forEach((link, index) => {
      const linkItem = document.createElement('div');
      linkItem.className = 'quick-link-item';
      linkItem.innerHTML = `
        <div class="quick-link-icon" style="background-color: ${link.color || 'var(--accent-color)'}">
          <i class="${link.icon}"></i>
        </div>
        <a href="${link.url}" class="quick-link-text" target="_blank">${link.name}</a>
      `;
      quickLinksList.appendChild(linkItem);
    });
  }
}

// --- Settings Management ---

/** Sets up settings functionality */
function setupSettings() {
  const {
    settingsBtn, settingsModal, closeSettingsModalBtn,
    customBgUpload, customBgBtn, resetBgBtn,
    blurAmount, blurValue, userNameInput,
    weatherLocationInput, resetSettingsBtn, saveSettingsBtn
  } = AppState.domRefs;
  
  // Open settings modal
  if (settingsBtn) {
    settingsBtn.addEventListener('click', openSettingsModal);
  }
  
  // Close settings modal
  if (closeSettingsModalBtn) {
    closeSettingsModalBtn.addEventListener('click', closeSettingsModal);
  }
  
  // Custom background upload
  if (customBgBtn && customBgUpload) {
    customBgBtn.addEventListener('click', () => {
      customBgUpload.click();
    });
    
    customBgUpload.addEventListener('change', handleBackgroundUpload);
  }
  
  // Reset background
  if (resetBgBtn) {
    resetBgBtn.addEventListener('click', resetBackground);
  }
  
  // Blur amount slider
  if (blurAmount && blurValue) {
    // Set initial value
    blurAmount.value = AppState.settings.bgBlur || 5;
    blurValue.textContent = `${blurAmount.value}px`;
    
    // Update CSS variable and display on change
    blurAmount.addEventListener('input', () => {
      const value = blurAmount.value;
      document.documentElement.style.setProperty('--bg-blur', `${value}px`);
      blurValue.textContent = `${value}px`;
      AppState.settings.bgBlur = value;
    });
  }
  
  // Save settings
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', saveSettings);
  }
  
  // Reset all settings
  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', resetAllSettings);
  }
  
  // Initialize settings
  initializeSettingsForm();
}

/** Opens the settings modal */
function openSettingsModal() {
  const { settingsModal } = AppState.domRefs;
  
  // Initialize form with current settings
  initializeSettingsForm();
  
  // Open modal
  settingsModal.classList.add('active');
}

/** Closes the settings modal */
function closeSettingsModal() {
  const { settingsModal } = AppState.domRefs;
  settingsModal.classList.remove('active');
}

/** Initializes the settings form with current settings */
function initializeSettingsForm() {
  const { userNameInput, weatherLocationInput, blurAmount } = AppState.domRefs;
  
  if (userNameInput) {
    userNameInput.value = AppState.settings.userName || '';
  }
  
  if (weatherLocationInput) {
    weatherLocationInput.value = AppState.settings.weatherLocation || '';
  }
  
  if (blurAmount) {
    blurAmount.value = AppState.settings.bgBlur || 5;
    document.getElementById('blur-value').textContent = `${blurAmount.value}px`;
    document.documentElement.style.setProperty('--bg-blur', `${blurAmount.value}px`);
  }
}

/** Handles custom background image upload */
function handleBackgroundUpload(e) {
  const file = e.target.files[0];
  
  if (!file) return;
  
  const reader = new FileReader();
  
  reader.onload = (event) => {
    // Store image data in settings
    AppState.settings.customBackground = event.target.result;
    
    // Apply background
    applyCustomBackground(event.target.result);
    
    // Save settings
    saveData('settings');
  };
  
  reader.readAsDataURL(file);
}

/** Applies a custom background image */
function applyCustomBackground(imageData) {
  if (!imageData) return;
  
  document.body.classList.add('custom-bg');
  document.documentElement.style.setProperty('--bg-image', `url('${imageData}')`);
}

/** Resets the background to the theme default */
function resetBackground() {
  document.body.classList.remove('custom-bg');
  document.documentElement.style.removeProperty('--bg-image');
  
  // Clear stored background
  AppState.settings.customBackground = null;
  saveData('settings');
}

/** Saves settings from the modal form */
function saveSettings() {
  const { userNameInput, weatherLocationInput, blurAmount } = AppState.domRefs;
  
  // Update settings object
  if (userNameInput) {
    AppState.settings.userName = userNameInput.value.trim();
  }
  
  if (weatherLocationInput) {
    AppState.settings.weatherLocation = weatherLocationInput.value.trim();
  }
  
  if (blurAmount) {
    AppState.settings.bgBlur = blurAmount.value;
  }
  
  // Save to localStorage
  saveData('settings');
  
  // Update UI that depends on settings
  updateGreeting(new Date().getHours());
  
  // Fetch weather with new location if provided
  if (weatherLocationInput && weatherLocationInput.value.trim()) {
    fetchWeather();
  }
  
  // Close the modal
  closeSettingsModal();
}

/** Resets all settings to defaults */
function resetAllSettings() {
  if (confirm('Reset all settings to default values? This cannot be undone.')) {
    // Reset settings to defaults
    AppState.settings = {
      theme: 'ocean',
      customBackground: null,
      searchEngine: 'google',
      userName: '',
      weatherLocation: '',
      bgBlur: '5'
    };
    
    // Reset UI elements
    document.body.classList.remove('custom-bg');
    document.documentElement.style.removeProperty('--bg-image');
    document.documentElement.style.setProperty('--bg-blur', '5px');
    
    // Apply default theme
    applyTheme('ocean');
    
    // Save to localStorage
    saveData('settings');
    
    // Update form
    initializeSettingsForm();
    
    // Update dependent UI elements
    updateGreeting(new Date().getHours());
    fetchWeather();
    
    // Notify user
    alert('All settings have been reset to defaults.');
  }
}

// --- Sidebar Management ---

/** Sets up sidebar functionality */
function setupSidebar() {
  const { sidebarToggle, closeSidebarBtn, sidebarElement } = AppState.domRefs;
  
  // Toggle sidebar
  if (sidebarToggle && sidebarElement) {
    sidebarToggle.addEventListener('click', () => {
      sidebarElement.classList.toggle('active');
    });
  }
  
  // Close sidebar
  if (closeSidebarBtn && sidebarElement) {
    closeSidebarBtn.addEventListener('click', () => {
      sidebarElement.classList.remove('active');
    });
  }
  
  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth < 768) {
      if (sidebarElement && sidebarElement.classList.contains('active')) {
        const isClickInsideSidebar = sidebarElement.contains(e.target);
        const isClickOnToggleButton = sidebarToggle && sidebarToggle.contains(e.target);
        
        if (!isClickInsideSidebar && !isClickOnToggleButton) {
          sidebarElement.classList.remove('active');
        }
      }
    }
  });
}

// --- Voice Input ---

/** Sets up voice input functionality */
function setupVoiceInput() {
  const { voiceBtn, searchInput } = AppState.domRefs;
  
  if (!voiceBtn || !searchInput) return;
  
  // Check if browser supports speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    // Hide button if not supported
    voiceBtn.style.display = 'none';
    return;
  }
  
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;
  
  // Start listening when button is clicked
  voiceBtn.addEventListener('click', () => {
    // Visual feedback - add active class
    voiceBtn.classList.add('active');
    voiceBtn.innerHTML = '<i class="fas fa-microphone-alt"></i>';
    
    recognition.start();
  });
  
  // Process speech results
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchInput.value = transcript;
    
    // Focus on input
    searchInput.focus();
  };
  
  // Reset button when done
  recognition.onend = () => {
    voiceBtn.classList.remove('active');
    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
  };
  
  // Handle errors
  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    voiceBtn.classList.remove('active');
    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
  };
}

/** Initializes UI animations */
function setupAnimations() {
  // Add staggered fade-in animations to quick links grid
  const quickLinkCards = document.querySelectorAll('.quick-link-card');
  quickLinkCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 + (index * 50)); // Staggered delay
  });
  
  // Animate greeting text
  const greeting = document.getElementById('greeting');
  if (greeting) {
    greeting.classList.add('fade-in');
  }
  
  // Animate motivation text
  const motivation = document.getElementById('motivation');
  if (motivation) {
    motivation.style.opacity = '0';
    motivation.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
      motivation.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      motivation.style.opacity = '1';
      motivation.style.transform = 'translateY(0)';
    }, 300);
  }
}

// --- Initialization ---

/** Initialize the application */
function initApp() {
  // Cache DOM references
  cacheDomReferences();
  
  // Load saved data from localStorage
  loadData();
  
  // Set up theme management
  setupThemeSwitcher();
  
  // Apply custom background if it exists
  if (AppState.settings.customBackground) {
    applyCustomBackground(AppState.settings.customBackground);
  }
  
  // Apply blur setting
  document.documentElement.style.setProperty('--bg-blur', `${AppState.settings.bgBlur || 5}px`);
  
  // Set up time and date display
  updateTimeAndDate();
  setInterval(updateTimeAndDate, 60000); // Update every minute
  
  // Set up weather display
  fetchWeather();
  
  // Set up search functionality
  setupSearch();
  
  // Set up quick links 
  setupQuickLinks();
  
  // Set up settings management
  setupSettings();
  
  // Set up sidebar functionality
  setupSidebar();
  
  // Set up voice input
  setupVoiceInput();
  
  // Initialize animations
  setTimeout(setupAnimations, 500); // Delay to ensure DOM is fully ready
  
  console.log('Application initialized');
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

