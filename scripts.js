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

// Initialize todos from localStorage
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let quickLinks = JSON.parse(localStorage.getItem('quickLinks')) || [
    { name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'fas fa-robot' },
    { name: 'GitHub', url: 'https://github.com', icon: 'fab fa-github' },
    { name: 'Gmail', url: 'https://gmail.com', icon: 'fas fa-envelope' },
    { name: 'YouTube', url: 'https://youtube.com', icon: 'fab fa-youtube' },
    { name: 'Gemini', url: 'https://gemini.google.com', icon: 'fas fa-gem' },
    { name: 'Amity', url: 'https://amigo.amityonline.com/login/index.php', icon: 'fas fa-university' }
];

// Todo List Functions
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function createTodoElement(todo) {
    const li = document.createElement('li');
    li.innerHTML = `
        <div class="task-content ${todo.completed ? 'completed' : ''}">
            <input type="checkbox" class="task-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="task-text">${todo.text}</span>
        </div>
        <button class="delete-task" title="Delete Task">
            <i class="fas fa-trash"></i>
        </button>
    `;

    // Add checkbox functionality
    const checkbox = li.querySelector('.task-checkbox');
    checkbox.addEventListener('change', function() {
        todo.completed = checkbox.checked;
        const taskContent = li.querySelector('.task-content');
        taskContent.classList.toggle('completed', todo.completed);
        saveTodos();
    });

    // Add delete functionality
    const deleteBtn = li.querySelector('.delete-task');
    deleteBtn.addEventListener('click', function() {
        todos = todos.filter(t => t.id !== todo.id);
        saveTodos();
        li.remove();
    });

    return li;
}

function loadTodos() {
    const todoList = document.getElementById('todo-list');
    if (!todoList) return;
    
    todoList.innerHTML = '';
    todos.forEach(todo => {
        todoList.appendChild(createTodoElement(todo));
    });
}

function addTask() {
    const input = document.getElementById('new-task');
    if (!input) return;

    const text = input.value.trim();
    if (text) {
        const todo = {
            id: Date.now(),
            text: text,
            completed: false
        };
        
        todos.push(todo);
        saveTodos();
        
        const todoList = document.getElementById('todo-list');
        todoList.appendChild(createTodoElement(todo));
        
        input.value = '';
    }
}

// Quick Links Functions
function saveQuickLinks() {
    localStorage.setItem('quickLinks', JSON.stringify(quickLinks));
}

function createQuickLinkElement(link) {
    const element = document.createElement('a');
    element.href = link.url;
    element.className = 'quick-link';
    element.target = '_blank';
    element.innerHTML = `
        <div class="quick-link-content">
            <i class="${link.icon}"></i>
            <span>${link.name}</span>
        </div>
        <button class="delete-link" title="Delete Link">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add delete functionality
    const deleteBtn = element.querySelector('.delete-link');
    deleteBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        quickLinks = quickLinks.filter(l => l.url !== link.url);
        saveQuickLinks();
        loadQuickLinks();
    });

    return element;
}

function loadQuickLinks() {
    const container = document.getElementById('quick-links');
    if (!container) return;

    container.innerHTML = '';
    
    // Add all quick links
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

function addQuickLink() {
    const name = document.getElementById('link-name').value.trim();
    const url = document.getElementById('link-url').value.trim();
    const icon = document.getElementById('icon-select').value;

    if (name && url) {
        // Add http:// if no protocol specified
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        
        const newLink = {
            name: name,
            url: fullUrl,
            icon: icon
        };

        quickLinks.push(newLink);
        saveQuickLinks();
        loadQuickLinks();
        hideAddLinkModal();
    }
}

function updateIconPreview() {
    const iconSelect = document.getElementById('icon-select');
    const iconPreview = document.getElementById('icon-preview');
    if (iconSelect && iconPreview) {
        iconPreview.innerHTML = `<i class="${iconSelect.value}"></i>`;
    }
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize time
    updateTime();
    setInterval(updateTime, 1000);
    
    // Load saved todos and quick links
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
    
    // Add task button click handler
    const addTaskBtn = document.querySelector('.add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', addTask);
    }

    // Modal handlers
    const modal = document.getElementById('add-link-modal');
    const saveBtn = document.getElementById('save-link');
    const cancelBtn = document.getElementById('cancel-link');
    const closeBtn = document.getElementById('close-modal');
    const iconSelect = document.getElementById('icon-select');

    if (saveBtn) {
        saveBtn.addEventListener('click', addQuickLink);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideAddLinkModal);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', hideAddLinkModal);
    }

    if (iconSelect) {
        iconSelect.addEventListener('change', updateIconPreview);
    }

    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideAddLinkModal();
            }
        });
    }
    
    // Theme switcher toggle
    const toggleBtn = document.getElementById('toggle-theme-switcher');
    const themeSwitcher = document.querySelector('.theme-switcher');
    
    if (toggleBtn && themeSwitcher) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            themeSwitcher.classList.toggle('active');
        });

        // Close theme switcher when clicking outside
        document.addEventListener('click', (e) => {
            if (!themeSwitcher.contains(e.target)) {
                themeSwitcher.classList.remove('active');
            }
        });
    }

    // Sidebar Toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    let isSidebarOpen = false;

    sidebarToggle.addEventListener('click', () => {
        isSidebarOpen = !isSidebarOpen;
        sidebar.classList.toggle('active');
        sidebarToggle.innerHTML = isSidebarOpen ? 
            '<i class="fas fa-times"></i>' : 
            '<i class="fas fa-bars"></i>';
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target) && isSidebarOpen) {
            isSidebarOpen = false;
            sidebar.classList.remove('active');
            sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });

    // Custom background functionality
    const bgUpload = document.getElementById('bg-upload');
    const customBgBtn = document.querySelector('.custom-bg-btn');
    
    function applyCustomBackground(backgroundData) {
        document.body.style.backgroundImage = `linear-gradient(135deg, 
            var(--gradient-1),
            var(--gradient-2),
            var(--gradient-3),
            var(--gradient-4)), 
            url(${backgroundData})`;
        
        // Update active states
        themeButtons.forEach(btn => btn.classList.remove('active'));
        customBgBtn.classList.add('active');
        
        // Remove theme attribute but keep gradients
        document.documentElement.removeAttribute('data-theme');
    }
    
    bgUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const backgroundData = e.target.result;
                // Save the custom background to localStorage
                localStorage.setItem('custom-background', backgroundData);
                localStorage.setItem('selected-theme', 'custom');
                
                // Apply the custom background
                applyCustomBackground(backgroundData);
            };
            reader.readAsDataURL(file);
        }
    });

    // Theme buttons functionality
    const themeButtons = document.querySelectorAll('.theme-btn');
    
    function setActiveTheme(theme) {
        // Check if we should load custom background
        if (theme === 'custom') {
            const customBg = localStorage.getItem('custom-background');
            if (customBg) {
                applyCustomBackground(customBg);
                return;
            }
        }

        // Reset custom background if switching to a theme
        document.body.style.backgroundImage = '';
        customBgBtn.classList.remove('active');

        // Remove previous theme
        document.documentElement.classList.remove(
            'theme-ocean',
            'theme-sunset',
            'theme-forest',
            'theme-galaxy',
            'theme-desert',
            'theme-arctic',
            'theme-volcano'
        );
        
        // Set new theme
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.classList.add(`theme-${theme}`);
        
        // Save theme preference
        localStorage.setItem('selected-theme', theme);
        
        // Update active button state
        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
        });

        // Preload next theme's background
        const nextThemeBtn = document.querySelector(`.theme-btn[data-theme="${theme}"]`).nextElementSibling;
        if (nextThemeBtn) {
            const nextTheme = nextThemeBtn.getAttribute('data-theme');
            const img = new Image();
            img.src = `images/${nextTheme}.jpg`;
        }
    }

    // Preload all theme backgrounds
    const themes = ['ocean', 'sunset', 'forest', 'galaxy', 'desert', 'arctic', 'volcano'];
    themes.forEach(theme => {
        const img = new Image();
        img.src = `images/${theme}.jpg`;
    });

    themeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const theme = button.getAttribute('data-theme');
            setActiveTheme(theme);
        });
    });

    // Load saved theme or default to ocean
    const savedTheme = localStorage.getItem('selected-theme') || 'ocean';
    setActiveTheme(savedTheme);
});