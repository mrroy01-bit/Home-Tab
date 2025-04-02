// --- Global Variables & Initial Data ---
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let quickLinks = JSON.parse(localStorage.getItem('quickLinks')) || [
  // Default quick links if none are stored
  { name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'fas fa-robot' },
  { name: 'GitHub', url: 'https://github.com', icon: 'fab fa-github' },
  { name: 'Gmail', url: 'https://mail.google.com', icon: 'fas fa-envelope' }, // Corrected Gmail URL
  { name: 'YouTube', url: 'https://www.youtube.com', icon: 'fab fa-youtube' }, // Corrected YouTube URL
  { name: 'Gemini', url: 'https://gemini.google.com', icon: 'fas fa-gem' },
  { name: 'Amity', url: 'https://amigo.amityonline.com/login/index.php', icon: 'fas fa-university' }
];
let currentTheme = localStorage.getItem('selected-theme') || 'ocean'; // Default theme
let customBackground = localStorage.getItem('custom-background') || null;

// --- DOM Element References ---
// Use const for elements that don't change, let for those that might (though most are static)
const timeElement = document.getElementById('chatgpt-time');
const themeToggleButton = document.getElementById('toggle-theme-switcher');
const themeSwitcherPanel = document.getElementById('theme-switcher-panel');
const themeButtons = document.querySelectorAll('.theme-btn'); // Select all theme buttons
const customBgLabel = document.querySelector('.custom-bg-btn'); // Label for custom BG
const bgUploadInput = document.getElementById('bg-upload');
const searchInput = document.querySelector('.search-input');
const quickLinksContainer = document.getElementById('quick-links');
const todoList = document.getElementById('todo-list');
const newTaskInput = document.getElementById('new-task');
const addTaskButton = document.getElementById('add-task-btn');
const refreshTasksButton = document.getElementById('refresh-tasks-btn');
const addLinkModal = document.getElementById('add-link-modal');
const addLinkForm = document.getElementById('add-link-form'); // Get the form itself
const closeModalButton = document.getElementById('close-modal');
const saveLinkButton = document.getElementById('save-link');
const cancelLinkButton = document.getElementById('cancel-link');
const linkNameInput = document.getElementById('link-name');
const linkUrlInput = document.getElementById('link-url');
const iconSelect = document.getElementById('icon-select');
const iconPreview = document.getElementById('icon-preview');

// --- Core Functions ---

/**
 * Updates the time display in the header.
 */
function updateTime() {
  if (!timeElement) return; // Guard clause

  const now = new Date();
  // Options for formatting time (can be customized)
  const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false }; // Use 24-hour format
  const secondsOptions = { second: '2-digit'};

  const formattedTime = now.toLocaleTimeString([], timeOptions);
  const formattedSeconds = now.toLocaleTimeString([], secondsOptions);

  // Update HTML structure for better semantics if needed, or keep simple spans
  timeElement.innerHTML = `
      <span class="time-hours-minutes">${formattedTime}</span>
      <span class="time-seconds">:${formattedSeconds}</span>
    `;
}

/**
 * Saves the current todos array to localStorage.
 */
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

/**
 * Saves the current quickLinks array to localStorage.
 */
function saveQuickLinks() {
  localStorage.setItem('quickLinks', JSON.stringify(quickLinks));
}

/**
 * Creates an HTML list item element for a given todo object.
 * @param {object} todo - The todo object.
 * @returns {HTMLLIElement} The created list item element.
 */
function createTodoElement(todo) {
  const li = document.createElement('li');
  li.dataset.taskId = todo.id;
  // Add priority class for styling
  li.classList.add(`priority-${todo.priority || 'medium'}`); // Default to medium if no priority

  const taskContentDiv = document.createElement('div');
  taskContentDiv.className = 'task-content';
  if (todo.completed) {
    taskContentDiv.classList.add('completed');
  }

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = todo.completed;
  checkbox.setAttribute('aria-labelledby', `task-text-${todo.id}`); // Accessibility link

  const span = document.createElement('span');
  span.className = 'task-text';
  span.textContent = todo.text;
  span.id = `task-text-${todo.id}`; // ID for aria-labelledby

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-task';
  deleteBtn.title = `Delete Task: ${todo.text}`; // More descriptive title
  deleteBtn.setAttribute('aria-label', `Delete task: ${todo.text}`); // Accessibility
  deleteBtn.innerHTML = '<i class="fas fa-trash" aria-hidden="true"></i>'; // Hide icon from screen readers

  // Assemble the task content
  taskContentDiv.appendChild(checkbox);
  taskContentDiv.appendChild(span);

  // Assemble the list item
  li.appendChild(taskContentDiv);
  li.appendChild(deleteBtn);

  // Add event listeners directly here
  checkbox.addEventListener('change', handleTodoCheckboxChange);
  deleteBtn.addEventListener('click', handleTodoDelete);

  return li;
}

/**
 * Loads todos from the 'todos' array into the DOM.
 */
function loadTodos() {
  if (!todoList) return; // Guard clause

  todoList.innerHTML = ''; // Clear existing list
  if (todos.length === 0) {
      // Optional: Display a message when there are no tasks
      const emptyMessage = document.createElement('li');
      emptyMessage.textContent = "No tasks yet. Add one above!";
      emptyMessage.style.textAlign = 'center';
      emptyMessage.style.opacity = '0.7';
      emptyMessage.style.padding = '15px 0';
      todoList.appendChild(emptyMessage);
  } else {
      todos.forEach(todo => {
          todoList.appendChild(createTodoElement(todo));
      });
  }
  // Note: Event listeners are now added within createTodoElement,
  // so attachTodoEventListeners() is no longer needed here.
}

/**
 * Adds a new task based on the input field value.
 */
function addTask() {
  if (!newTaskInput) return;
  const text = newTaskInput.value.trim();
  if (!text) {
      // Optional: Add visual feedback for empty input
      newTaskInput.style.borderColor = 'red';
      setTimeout(() => { newTaskInput.style.borderColor = ''; }, 1500);
      return;
  }

  // Prompt for priority - consider a dropdown or buttons in the UI later for better UX
  const priorityInput = window.prompt('Set priority (high, medium, low):', 'medium');
  // Validate priority input
  const validPriorities = ['high', 'medium', 'low'];
  const priority = validPriorities.includes(priorityInput?.toLowerCase()) ? priorityInput.toLowerCase() : 'medium';

  const newTask = {
    id: Date.now(), // Simple unique ID
    text,
    priority: priority,
    completed: false,
    created: new Date().toISOString() // Store creation date
  };

  todos.push(newTask); // Add to the beginning or end? Push adds to end. Unshift adds to beginning.
  // todos.unshift(newTask); // Add to the top of the list
  saveTodos();
  loadTodos(); // Reload the list in the DOM
  newTaskInput.value = ''; // Clear the input field
  newTaskInput.focus(); // Keep focus on input for adding multiple tasks
}

/**
 * Creates an HTML anchor element for a given quick link object.
 * @param {object} link - The quick link object { name, url, icon }.
 * @returns {HTMLAnchorElement | HTMLButtonElement} The created anchor or button element.
 */
function createQuickLinkElement(link) {
    // Handle the special "Add Link" case
    if (link.isAddButton) {
        const addButton = document.createElement('button');
        addButton.id = 'add-quick-link';
        addButton.className = 'quick-link add-link'; // Use specific class
        addButton.setAttribute('aria-label', 'Add new quick link');
        addButton.innerHTML = `
          <div class="quick-link-content">
            <i class="fas fa-plus" aria-hidden="true"></i>
            <span>Add Link</span>
          </div>
        `;
        addButton.addEventListener('click', showAddLinkModal);
        return addButton;
    }

    // Regular quick link element
    const element = document.createElement('a');
    element.href = link.url;
    element.className = 'quick-link';
    element.target = '_blank'; // Open in new tab
    element.rel = 'noopener noreferrer'; // Security best practice
    element.setAttribute('draggable', 'true'); // Make draggable
    element.dataset.linkUrl = link.url; // Store URL for identification

    const contentDiv = document.createElement('div');
    contentDiv.className = 'quick-link-content';

    const icon = document.createElement('i');
    // Add error handling for icon classes if necessary
    icon.className = link.icon || 'fas fa-link'; // Default icon
    icon.setAttribute('aria-hidden', 'true'); // Hide decorative icon

    const span = document.createElement('span');
    span.textContent = link.name;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-link';
    deleteBtn.title = `Delete ${link.name}`;
    deleteBtn.setAttribute('aria-label', `Delete quick link: ${link.name}`);
    deleteBtn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
    deleteBtn.dataset.linkUrl = link.url; // Store URL for deletion reference

    // Assemble the content
    contentDiv.appendChild(icon);
    contentDiv.appendChild(span);

    // Assemble the link element
    element.appendChild(contentDiv);
    element.appendChild(deleteBtn);

    // Attach delete event listener directly
    deleteBtn.addEventListener('click', handleQuickLinkDelete);

    return element;
}

/**
 * Loads quick links into the grid and adds the "Add Link" button.
 */
function loadQuickLinks() {
  if (!quickLinksContainer) return; // Guard clause

  quickLinksContainer.innerHTML = ''; // Clear existing links

  // Add existing links
  quickLinks.forEach(link => {
    quickLinksContainer.appendChild(createQuickLinkElement(link));
  });

  // Add the "Add Link" button object and create its element
  quickLinksContainer.appendChild(createQuickLinkElement({ isAddButton: true }));

  // Re-attach drag and drop listeners if needed (or ensure they are attached to the container)
  // Event listeners for drag/drop are added to the container in DOMContentLoaded
}


/**
 * Shows the Add/Edit Link Modal. Resets the form for adding.
 */
function showAddLinkModal() {
  if (!addLinkModal) return;
  // Reset form for adding a new link
  addLinkForm.reset(); // Resets form fields
  updateIconPreview(); // Update preview to default
  document.getElementById('modal-title').textContent = 'Add Quick Link'; // Set title
  saveLinkButton.textContent = 'Save Link'; // Set button text
  addLinkModal.setAttribute('aria-hidden', 'false'); // Show modal
  addLinkModal.classList.add('active');
  linkNameInput.focus(); // Focus on the first input field
}

/**
 * Hides the Add/Edit Link Modal.
 */
function hideAddLinkModal() {
  if (!addLinkModal) return;
  addLinkModal.setAttribute('aria-hidden', 'true'); // Hide modal
  addLinkModal.classList.remove('active');
}

/**
 * Handles the submission of the Add/Edit Link form.
 * @param {Event} event - The form submission event.
 */
function handleAddEditLinkSubmit(event) {
  event.preventDefault(); // Prevent default form submission
  const name = linkNameInput.value.trim();
  const url = linkUrlInput.value.trim();
  const icon = iconSelect.value;

  if (name && url) {
    // Basic URL validation (starts with http or https)
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = `https://${url}`; // Assume https if no protocol
    }

    const newLink = { name, url: fullUrl, icon };
    quickLinks.push(newLink); // Add the new link
    saveQuickLinks();
    loadQuickLinks(); // Reload the grid
    hideAddLinkModal(); // Close the modal
  } else {
      // Optional: Add validation feedback to the user
      if (!name) linkNameInput.focus();
      else if (!url) linkUrlInput.focus();
  }
}

/**
 * Updates the icon preview in the modal based on the selected value.
 */
function updateIconPreview() {
  if (iconSelect && iconPreview) {
    iconPreview.innerHTML = `<i class="${iconSelect.value}" aria-hidden="true"></i>`;
  }
}

/**
 * Sets the active theme on the document and saves it.
 * @param {string} theme - The name of the theme to activate (e.g., "ocean", "custom").
 */
function setActiveTheme(theme) {
  const htmlElement = document.documentElement;

  // Remove previous theme attribute
  htmlElement.removeAttribute('data-theme');

  if (theme === 'custom' && customBackground) {
    // Apply custom background if theme is 'custom' and an image exists
    document.body.style.backgroundImage = `url(${customBackground})`;
    // Optionally remove gradient overlay for custom BG, or keep it:
    // document.body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${customBackground})`;
    htmlElement.setAttribute('data-theme', 'custom'); // Still set attribute for potential specific custom styles
  } else {
    // Apply predefined theme
    document.body.style.backgroundImage = ''; // Clear direct background image style
    htmlElement.setAttribute('data-theme', theme);
  }

  // Update active state on buttons
  themeButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
  });
  // Ensure custom background label doesn't show active unless theme is 'custom'
  customBgLabel?.classList.toggle('active', theme === 'custom');


  localStorage.setItem('selected-theme', theme);
  currentTheme = theme; // Update global variable

  // Update meta theme color for browser UI consistency
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
      // Get the computed background color (might be complex with gradients)
      // A simpler approach is to define a --theme-color variable per theme
      // For now, use a default or fetch a specific variable if defined
      // Example: const color = getComputedStyle(htmlElement).getPropertyValue('--accent');
      // themeColorMeta.setAttribute('content', color);
      // Or set a fixed color based on theme:
      const colors = { ocean: '#1a4f60', sunset: '#ff6f61', forest: '#22592e', /* ... add others */ minimalist: '#f5f5f5', cityscape: '#191970'};
      themeColorMeta.setAttribute('content', colors[theme] || '#1a4f60'); // Default if theme not in map
  }
}


/**
 * Applies a custom background image from base64 data.
 * @param {string} backgroundData - Base64 encoded image data.
 */
function applyCustomBackground(backgroundData) {
  customBackground = backgroundData; // Store globally
  localStorage.setItem('custom-background', backgroundData); // Save to localStorage
  setActiveTheme('custom'); // Activate the custom theme setting
}

// --- Event Handlers ---

/**
 * Handles clicks on the theme toggle button.
 */
function handleThemeToggleClick(event) {
    event.stopPropagation(); // Prevent click from closing the panel immediately
    const isExpanded = themeSwitcherPanel.classList.toggle('active');
    themeToggleButton.setAttribute('aria-expanded', isExpanded); // Update ARIA state
}

/**
 * Handles clicks outside the theme switcher to close it.
 * @param {Event} event - The click event.
 */
function handleDocumentClick(event) {
    if (themeSwitcherPanel && themeSwitcherPanel.classList.contains('active') &&
        !themeSwitcherPanel.contains(event.target) && event.target !== themeToggleButton) {
        themeSwitcherPanel.classList.remove('active');
        themeToggleButton.setAttribute('aria-expanded', 'false'); // Update ARIA state
    }
}


/**
 * Handles clicks on predefined theme buttons.
 * @param {Event} event - The click event.
 */
function handleThemeButtonClick(event) {
    // Use currentTarget to ensure it's the button the listener was attached to
    const theme = event.currentTarget.getAttribute('data-theme');
    if (theme) {
        setActiveTheme(theme);
        // Optional: Close the theme switcher after selection
        // themeSwitcherPanel.classList.remove('active');
        // themeToggleButton.setAttribute('aria-expanded', 'false');
    }
}

/**
 * Handles the change event for the background image upload input.
 * @param {Event} event - The change event.
 */
function handleBackgroundUpload(event) {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) { // Basic validation
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
          applyCustomBackground(e.target.result);
      } catch (error) {
          console.error("Error applying custom background:", error);
          // Optionally inform the user
          alert("Could not apply custom background. The file might be corrupted or too large.");
      }
    };
    reader.onerror = function() {
        console.error("Error reading file:", reader.error);
        alert("Could not read the selected file.");
    };
    reader.readAsDataURL(file); // Read file as Base64
  } else if (file) {
      alert("Please select a valid image file (e.g., JPG, PNG, GIF).");
  }
}

/**
 * Handles the Enter key press in the new task input field.
 * @param {KeyboardEvent} event - The keypress event.
 */
function handleNewTaskKeyPress(event) {
  if (event.key === 'Enter') {
    addTask();
  }
}

/**
 * Handles changes to a todo item's checkbox.
 * @param {Event} event - The change event from the checkbox.
 */
function handleTodoCheckboxChange(event) {
    const checkbox = event.currentTarget;
    const li = checkbox.closest('li'); // Find the parent list item
    const taskId = li?.dataset.taskId; // Get the task ID

    if (taskId) {
        const todo = todos.find(t => t.id == taskId); // Find the corresponding todo object (use == for type coercion if IDs are mixed)
        if (todo) {
            todo.completed = checkbox.checked; // Update the completed status
            saveTodos(); // Save the updated todos array
            // Toggle completed class on the task content container
            li.querySelector('.task-content')?.classList.toggle('completed', checkbox.checked);
        } else {
            console.error("Could not find todo with ID:", taskId);
        }
    } else {
        console.error("Could not find task ID for checkbox:", checkbox);
    }
}

/**
 * Handles clicks on a todo item's delete button.
 * @param {Event} event - The click event from the delete button.
 */
function handleTodoDelete(event) {
    const deleteButton = event.currentTarget;
    const li = deleteButton.closest('li'); // Find the parent list item
    const taskId = li?.dataset.taskId; // Get the task ID

    if (taskId) {
        // Optional: Confirmation dialog
        // if (!confirm(`Are you sure you want to delete the task: "${li.querySelector('.task-text')?.textContent}"?`)) {
        //     return;
        // }

        // Filter out the todo item to be deleted
        todos = todos.filter(t => t.id != taskId); // Use != for type coercion
        saveTodos(); // Save the updated array

        // Remove the list item from the DOM with an animation
        li.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        li.style.opacity = '0';
        li.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            li.remove();
            // Check if the list is now empty and show message if needed
            if (todos.length === 0) {
                loadTodos(); // Reload to show the empty message
            }
        }, 300); // Wait for animation to finish

    } else {
        console.error("Could not find task ID for delete button:", deleteButton);
    }
}


/**
 * Handles clicks on a quick link's delete button.
 * @param {Event} event - The click event.
 */
function handleQuickLinkDelete(event) {
    event.preventDefault(); // Prevent navigation if the click bubbles to the anchor
    event.stopPropagation(); // Stop propagation to the anchor's drag/click listeners

    const deleteButton = event.currentTarget;
    const linkUrlToDelete = deleteButton.dataset.linkUrl; // Get URL from data attribute

    if (linkUrlToDelete) {
         // Optional: Confirmation
        // const linkName = deleteButton.closest('.quick-link').querySelector('span')?.textContent || 'this link';
        // if (!confirm(`Are you sure you want to delete ${linkName}?`)) {
        //     return;
        // }

        quickLinks = quickLinks.filter(link => link.url !== linkUrlToDelete);
        saveQuickLinks();
        loadQuickLinks(); // Reload the grid
    } else {
        console.error("Could not find link URL to delete for button:", deleteButton);
    }
}

/**
 * Handles keyboard shortcuts.
 * @param {KeyboardEvent} event - The keydown event.
 */
function handleKeyDown(event) {
    // Ctrl + / or Cmd + / to focus search
    if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        searchInput?.focus();
    }
    // Ctrl + N or Cmd + N to focus new task input
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        newTaskInput?.focus();
    }
    // Ctrl + T or Cmd + T to toggle theme switcher
    if ((event.ctrlKey || event.metaKey) && event.key === 't') {
        event.preventDefault();
        handleThemeToggleClick(event); // Reuse toggle handler logic
    }
    // Escape key to close modal or theme switcher
    if (event.key === 'Escape') {
        if (addLinkModal && addLinkModal.classList.contains('active')) {
            hideAddLinkModal();
        } else if (themeSwitcherPanel && themeSwitcherPanel.classList.contains('active')) {
            themeSwitcherPanel.classList.remove('active');
            themeToggleButton.setAttribute('aria-expanded', 'false');
        }
    }
}

// --- Drag and Drop for Quick Links ---
let draggingElement = null;

function handleDragStart(e) {
    // Only allow dragging actual links, not the 'add' button
    if (e.target.classList.contains('quick-link') && !e.target.classList.contains('add-link')) {
        draggingElement = e.target;
        // Use setTimeout to allow the browser to render the drag image before adding class
        setTimeout(() => e.target.classList.add('dragging'), 0);
        e.dataTransfer.effectAllowed = 'move';
        // Optional: Set data being dragged (e.g., the link URL)
        // e.dataTransfer.setData('text/plain', e.target.dataset.linkUrl);
    } else {
        e.preventDefault(); // Prevent dragging the 'add' button
    }
}

function handleDragEnd(e) {
    if (draggingElement) {
        draggingElement.classList.remove('dragging');
        draggingElement = null;

        // Update the order in the quickLinks array based on DOM order
        const updatedLinksOrder = [];
        quickLinksContainer.querySelectorAll('.quick-link:not(.add-link)').forEach(linkElement => {
            const url = linkElement.dataset.linkUrl;
            const foundLink = quickLinks.find(link => link.url === url);
            if (foundLink) {
                updatedLinksOrder.push(foundLink);
            }
        });
        quickLinks = updatedLinksOrder;
        saveQuickLinks(); // Save the new order
    }
}

function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';

    const container = quickLinksContainer;
    const afterElement = getDragAfterElement(container, e.clientY);
    const draggable = document.querySelector('.dragging');

    if (draggable) { // Ensure we have a draggable element
        if (afterElement == null) {
            // Append if dragging past the end (but before the 'add' button if it exists)
            const addButton = container.querySelector('.add-link');
            if (addButton) {
                container.insertBefore(draggable, addButton);
            } else {
                container.appendChild(draggable);
            }
        } else {
            // Insert before the element we are hovering over
            container.insertBefore(draggable, afterElement);
        }
    }
}

function getDragAfterElement(container, y) {
    // Get all draggable elements *except* the one being dragged and the 'add' button
    const draggableElements = [...container.querySelectorAll('.quick-link:not(.dragging):not(.add-link)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        // Calculate vertical midpoint of the element
        const offset = y - box.top - box.height / 2;
        // We want the element *below* the cursor (negative offset)
        // that is closest to the cursor (largest negative offset)
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element; // Initial closest offset is negative infinity
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  // Initial setup
  updateTime();
  setInterval(updateTime, 1000); // Update time every second

  // Apply saved theme/background on load
  if (currentTheme === 'custom' && customBackground) {
      applyCustomBackground(customBackground);
  } else {
      setActiveTheme(currentTheme); // Apply saved or default theme
  }

  loadTodos();
  loadQuickLinks();

  // --- Attach Event Listeners ---

  // Theme Switcher
  if (themeToggleButton && themeSwitcherPanel) {
    themeToggleButton.addEventListener('click', handleThemeToggleClick);
    document.addEventListener('click', handleDocumentClick); // Close on outside click
  }
  themeButtons.forEach(button => {
    button.addEventListener('click', handleThemeButtonClick);
    // Optional: Preview on hover (can be complex with background images)
    // button.addEventListener('mouseenter', () => { /* ... */ });
    // button.addEventListener('mouseleave', () => { /* ... */ });
  });

  // Custom Background
  if (bgUploadInput) {
    bgUploadInput.addEventListener('change', handleBackgroundUpload);
  }

  // Todo Input & Add Button
  if (newTaskInput) {
    newTaskInput.addEventListener('keypress', handleNewTaskKeyPress);
  }
  if (addTaskButton) {
    addTaskButton.addEventListener('click', addTask);
  }
  // Refresh Button (if functionality is desired beyond initial load)
  if (refreshTasksButton) {
      refreshTasksButton.addEventListener('click', () => {
          // Add a visual cue for refreshing
          refreshTasksButton.classList.add('refreshing');
          refreshTasksButton.disabled = true;
          setTimeout(() => {
              loadTodos(); // Reload tasks
              refreshTasksButton.classList.remove('refreshing');
              refreshTasksButton.disabled = false;
          }, 500); // Simulate loading
      });
  }


  // Add/Edit Link Modal
  if (addLinkForm) {
    addLinkForm.addEventListener('submit', handleAddEditLinkSubmit);
  }
  if (closeModalButton) {
    closeModalButton.addEventListener('click', hideAddLinkModal);
  }
  if (cancelLinkButton) {
    cancelLinkButton.addEventListener('click', hideAddLinkModal);
  }
  if (iconSelect) {
    iconSelect.addEventListener('change', updateIconPreview);
  }
  // Close modal on background click
  if (addLinkModal) {
    addLinkModal.addEventListener('click', (e) => {
      if (e.target === addLinkModal) { // Check if the click was directly on the modal background
        hideAddLinkModal();
      }
    });
  }

  // Keyboard Shortcuts
  document.addEventListener('keydown', handleKeyDown);

  // Drag and Drop for Quick Links (Listeners on the container)
  if (quickLinksContainer) {
      quickLinksContainer.addEventListener('dragstart', handleDragStart);
      quickLinksContainer.addEventListener('dragend', handleDragEnd);
      quickLinksContainer.addEventListener('dragover', handleDragOver);
      // 'drop' event is implicitly handled by dragend saving the order
  }

}); // End DOMContentLoaded
