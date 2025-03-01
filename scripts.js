// Update time display
function updateTime() {
    const timeElement = document.getElementById('chatgpt-time');
    if (!timeElement) return;
  
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
  
    timeElement.innerHTML = `
      <span style="font-size: 1.2em">${hours}:${minutes}</span>
      <span style="font-size: 0.8em">:${seconds}</span>
    `;
  }
  
  // Initialize todos and quickLinks from localStorage
  let todos = JSON.parse(localStorage.getItem('todos')) || [];
  let quickLinks = JSON.parse(localStorage.getItem('quickLinks')) || [
    { name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'fas fa-robot' },
    { name: 'GitHub', url: 'https://github.com', icon: 'fab fa-github' },
    { name: 'Gmail', url: 'https://gmail.com', icon: 'fas fa-envelope' },
    { name: 'YouTube', url: 'https://youtube.com', icon: 'fab fa-youtube' },
    { name: 'Gemini', url: 'https://gemini.google.com', icon: 'fas fa-gem' },
    { name: 'Amity', url: 'https://amigo.amityonline.com/login/index.php', icon: 'fas fa-university' }
  ];
  
  // Save todos and quickLinks to localStorage
  function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }
  
  function saveQuickLinks() {
    localStorage.setItem('quickLinks', JSON.stringify(quickLinks));
  }
  
  // Create todo element
  function createTodoElement(todo) {
    const li = document.createElement('li');
    li.dataset.taskId = todo.id;
  
    const div = document.createElement('div');
    div.className = `task-content ${todo.completed ? 'completed' : ''}`;
  
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = todo.completed;
  
    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = todo.text;
  
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-task';
    deleteBtn.title = 'Delete Task';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  
    div.appendChild(checkbox);
    div.appendChild(span);
    li.appendChild(div);
    li.appendChild(deleteBtn);
  
    return li;
  }
  
  // Load todos into list
  function loadTodos() {
    const todoList = document.getElementById('todo-list');
    if (!todoList) return;
  
    todoList.innerHTML = '';
    todos.forEach(todo => {
      todoList.appendChild(createTodoElement(todo));
    });
    attachTodoEventListeners();
  }
  
  // Add new task
  function addTask() {
    const input = document.getElementById('new-task');
    const text = input.value.trim();
    if (!text) return;
  
    const priority = window.prompt('Set priority (high/medium/low)', 'medium');
    const task = {
      id: Date.now(),
      text,
      priority: priority || 'medium',
      completed: false,
      created: new Date()
    };
  
    todos.push(task);
    saveTodos();
    loadTodos();
    input.value = '';
  }
  
  // Create quick link element
  function createQuickLinkElement(link) {
    const element = document.createElement('a');
    element.href = link.url;
    element.className = 'quick-link';
    element.target = '_blank';
  
    const content = document.createElement('div');
    content.className = 'quick-link-content';
  
    const icon = document.createElement('i');
    icon.className = link.icon;
  
    const span = document.createElement('span');
    span.textContent = link.name;
  
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-link';
    deleteBtn.title = 'Delete Link';
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
  
    content.appendChild(icon);
    content.appendChild(span);
    element.appendChild(content);
    element.appendChild(deleteBtn);
  
    // Attach delete event for this link
    deleteBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      quickLinks = quickLinks.filter(l => l.url !== link.url);
      saveQuickLinks();
      loadQuickLinks();
    });
  
    return element;
  }
  
  // Load quick links into grid and add "Add Link" button
  function loadQuickLinks() {
    const container = document.getElementById('quick-links');
    if (!container) return;
  
    container.innerHTML = '';
    quickLinks.forEach(link => {
      container.appendChild(createQuickLinkElement(link));
    });
  
    // Add the "Add Link" button
    const addButton = document.createElement('button');
    addButton.id = 'add-quick-link';
    addButton.className = 'quick-link add-link';
    addButton.innerHTML = `
      <i class="fas fa-plus"></i>
      <span>Add Link</span>
    `;
    addButton.addEventListener('click', showAddLinkModal);
    container.appendChild(addButton);
  }
  
  // Show/hide Add Link Modal
  function showAddLinkModal() {
    const modal = document.getElementById('add-link-modal');
    if (modal) {
      modal.classList.add('active');
      document.getElementById('link-name').value = '';
      document.getElementById('link-url').value = '';
      document.getElementById('icon-select').value = 'fas fa-link';
      updateIconPreview();
    }
  }
  
  function hideAddLinkModal() {
    const modal = document.getElementById('add-link-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }
  
  // Add quick link from modal inputs
  function addQuickLink() {
    const name = document.getElementById('link-name').value.trim();
    const url = document.getElementById('link-url').value.trim();
    const icon = document.getElementById('icon-select').value;
  
    if (name && url) {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      const newLink = { name, url: fullUrl, icon };
      quickLinks.push(newLink);
      saveQuickLinks();
      loadQuickLinks();
      hideAddLinkModal();
    }
  }
  
  // Update icon preview in modal
  function updateIconPreview() {
    const iconSelect = document.getElementById('icon-select');
    const iconPreview = document.getElementById('icon-preview');
    if (iconSelect && iconPreview) {
      iconPreview.innerHTML = `<i class="${iconSelect.value}"></i>`;
    }
  }
  
  // Attach event listeners for todos
  function attachTodoEventListeners() {
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        const li = this.closest('li');
        const taskId = li.dataset.taskId;
        li.querySelector('.task-content').classList.toggle('completed', this.checked);
        const todo = todos.find(t => t.id == taskId);
        if (todo) {
          todo.completed = this.checked;
          saveTodos();
        }
      });
    });
  
    document.querySelectorAll('.delete-task').forEach(btn => {
      btn.addEventListener('click', function() {
        const li = this.closest('li');
        const taskId = li.dataset.taskId;
        todos = todos.filter(t => t.id != taskId);
        saveTodos();
        li.remove();
      });
    });
  }
  
  // Theme switching functionality
  let themeButtons; // will be initialized in DOMContentLoaded
  
  function setActiveTheme(theme) {
    if (theme !== 'custom') {
      document.body.style.backgroundImage = '';
    }
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', theme);
    themeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
    });
    localStorage.setItem('selected-theme', theme);
  }
  
  // Custom background functionality
  function applyCustomBackground(backgroundData) {
    document.body.style.backgroundImage = `linear-gradient(135deg, var(--bg-gradient-1), var(--bg-gradient-2), var(--bg-gradient-3), var(--bg-gradient-4)), url(${backgroundData})`;
    themeButtons.forEach(btn => btn.classList.remove('active'));
    localStorage.setItem('selected-theme', 'custom');
  }
  
  // Global initialization
  document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    setInterval(updateTime, 1000);
  
    loadTodos();
    loadQuickLinks();
  
    // Add task on Enter key
    const newTaskInput = document.getElementById('new-task');
    if (newTaskInput) {
      newTaskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          addTask();
        }
      });
    }
  
    // Modal event handlers
    const modal = document.getElementById('add-link-modal');
    const saveBtn = document.getElementById('save-link');
    const cancelBtn = document.getElementById('cancel-link');
    const closeBtn = document.getElementById('close-modal');
    const iconSelect = document.getElementById('icon-select');
  
    if (saveBtn) saveBtn.addEventListener('click', addQuickLink);
    if (cancelBtn) cancelBtn.addEventListener('click', hideAddLinkModal);
    if (closeBtn) closeBtn.addEventListener('click', hideAddLinkModal);
    if (iconSelect) iconSelect.addEventListener('change', updateIconPreview);
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) hideAddLinkModal();
      });
    }
  
    // Theme switcher toggle
    const toggleBtn = document.getElementById('toggle-theme-switcher');
    const themeSwitcher = document.querySelector('.theme-switcher');
    if (toggleBtn && themeSwitcher) {
      toggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        themeSwitcher.classList.toggle('active');
      });
      document.addEventListener('click', (e) => {
        if (!themeSwitcher.contains(e.target)) {
          themeSwitcher.classList.remove('active');
        }
      });
    }
  
    // Initialize theme buttons
    themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        const theme = button.getAttribute('data-theme');
        setActiveTheme(theme);
      });
      // Theme preview on hover
      button.addEventListener('mouseenter', () => {
        document.body.dataset.previewTheme = button.dataset.theme;
      });
      button.addEventListener('mouseleave', () => {
        delete document.body.dataset.previewTheme;
      });
    });
  
    // Load saved theme or default to ocean
    const savedTheme = localStorage.getItem('selected-theme') || 'ocean';
    setActiveTheme(savedTheme);
  
    // Custom background upload handler
    const bgUpload = document.getElementById('bg-upload');
    if (bgUpload) {
      bgUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(e) {
            const backgroundData = e.target.result;
            localStorage.setItem('custom-background', backgroundData);
            applyCustomBackground(backgroundData);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        document.querySelector('.search-input').focus();
      }
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        document.getElementById('new-task').focus();
      }
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        themeSwitcher.classList.toggle('active');
      }
    });
  
    // Drag and drop for quick links
    const quickLinksContainer = document.querySelector('.quick-links-grid');
    let draggingElement = null;
  
    quickLinksContainer.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('quick-link')) {
        draggingElement = e.target;
        e.target.classList.add('dragging');
      }
    });
  
    quickLinksContainer.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('quick-link')) {
        e.target.classList.remove('dragging');
      }
    });
  
    quickLinksContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(quickLinksContainer, e.clientY);
      const draggable = document.querySelector('.dragging');
      if (afterElement == null) {
        quickLinksContainer.appendChild(draggable);
      } else {
        quickLinksContainer.insertBefore(draggable, afterElement);
      }
    });
  
    function getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll('.quick-link:not(.dragging)')];
      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
  });
  
  // Optional: A function to refresh tasks (if needed)
  function refreshTasks() {
    loadTodos();
  }
  